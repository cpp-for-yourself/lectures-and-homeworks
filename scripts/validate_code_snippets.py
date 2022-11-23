import re
import sys
import logging
import tempfile
import typer
from os import environ, killpg, terminal_size
from pathlib import Path
from string import Template
from signal import SIGINT
from rich import print
from rich.text import Text
from rich.panel import Panel
from rich.padding import Padding
from rich.syntax import Syntax
from rich.console import Group
from rich.pretty import Pretty
from typing import List, Optional, Mapping, Any
from subprocess import PIPE, Popen, TimeoutExpired, CalledProcessError, CompletedProcess

FORMAT = "%(message)s"
logging.basicConfig(format=FORMAT)
log = logging.getLogger("code_validation")
log.setLevel(logging.INFO)


# See a playground here: https://regex101.com/r/Tfwjsq/1
REGEX_TEMPLATE = r"""
(?:\s*<!--
(:?\s*`CPP_SETUP_START`\n(?P<setup>(?:[^`]+)\n)\s*`CPP_SETUP_END`\s*)*\s*
(?P<skip>`CPP_SKIP_SNIPPET`)*\s*
(?:`CPP_COPY_SNIPPET`\s*(?P<copy>.*$))*\s*
(?:`CPP_RUN_CMD`\s*(?:CWD:(?P<cwd>[\w/]+))*\s*(?P<cmd>.*$))*\s*
-->\s*)*
```(?P<language>\w+)
(?P<code>(?:[^`]+)\n)+\s*
```\s*
"""

DEFAULT_CMD_PER_LANGUAGE = {
    "cpp": "c++ -std=c++17 $FILENAME",
    "c++": "c++ -std=c++17 $FILENAME",
    "cmake": "cmake -P $FILENAME",
    "bash": "",
    "make": "make",
}


class CmdResult:
    def __init__(self, status, stdout, stderr) -> None:
        self.status = status
        self.stdout = stdout
        self.stderr = stderr


def run_command(
    command: List[str],
    timeout: float,
    cwd: Path = Path.cwd(),
    env: Optional[Mapping[str, Any]] = None,
) -> CmdResult:
    """Run a generic command in a subprocess.
    Args:
        command (str): command to run
    Returns:
        CmdResult: Result of the command execution
    """
    try:
        startupinfo = None
        if env is None:
            env = environ
        process = __run_subprocess(
            command,
            stdout=PIPE,
            stderr=PIPE,
            stdin=PIPE,
            shell=True,
            cwd=str(cwd),
            env=env,
            startupinfo=startupinfo,
            timeout=timeout,
        )
        return CmdResult(
            status=process.returncode,
            stdout=process.stdout.decode("utf-8"),
            stderr=process.stderr.decode("utf-8"),
        )
    except CalledProcessError as error:
        output_text = error.output.decode("utf-8")
        log.error("command '%s' finished with code: %s", error.cmd, error.status)
        log.debug("command output: \n%s", output_text)
        return CmdResult(status=error.status, stderr=output_text)
    except TimeoutExpired as error:
        output_text = "Timeout: command '{}' ran longer than {} seconds".format(
            error.cmd.strip(), error.timeout
        )
        log.error(output_text)
        return CmdResult(status=CmdResult.TIMEOUT, stderr=output_text)


def __run_subprocess(
    command: List[str],
    str_input: str = None,
    timeout: float = None,
    check: bool = False,
    **kwargs,
) -> CompletedProcess:
    """Run a command as a subprocess.
    Using the guide from StackOverflow:
    https://stackoverflow.com/a/36955420/1763680
    This command has been adapted from:
    https://github.com/python/cpython/blob/3.5/Lib/subprocess.py#L352-L399
    This code does essentially the same as subprocess.run(...) but makes sure to
    kill the whole process tree which allows to use the timeout even when using
    shell=True. The reason I don't want to stop using shell=True here is the
    convenience of piping arguments from one function to another.
    """
    if str_input is not None:
        if "stdin" in kwargs:
            raise ValueError("stdin and str_input arguments may not both be used.")
        kwargs["stdin"] = PIPE

    if timeout is None:
        timeout = 20
    with Popen(command, start_new_session=True, **kwargs) as process:
        try:
            stdout, stderr = process.communicate(str_input, timeout=timeout)
        except TimeoutExpired as timeout_error:
            # Kill the whole group of processes.
            killpg(process.pid, SIGINT)
            stdout, stderr = process.communicate()
            raise TimeoutExpired(
                process.args, timeout, output=stdout, stderr=stderr
            ) from timeout_error
        return_code = process.poll()
        if return_code is None:
            return_code = 1
        if check and return_code:
            raise CalledProcessError(
                return_code, process.args, output=stdout, stderr=stderr
            )
    return CompletedProcess(process.args, return_code, stdout, stderr)


def compile_all_snippets(regex_pattern: str, file: Path):
    def get_file_object(language, file_name=None):
        if not file_name:
            return tempfile.NamedTemporaryFile(suffix="." + language, delete=False)
        return open(file_name, "wb")

    error_count = 0
    temp_folder = Path(tempfile.gettempdir())
    for match in re.finditer(pattern=regex_pattern, string=file.read_text()):
        found_group_dict = match.groupdict()
        skip = found_group_dict["skip"]
        setup = found_group_dict["setup"]
        code = found_group_dict["code"]
        copy_destination = found_group_dict["copy"]
        cmd = found_group_dict["cmd"]
        cwd = found_group_dict["cwd"]
        language = found_group_dict["language"]
        if language not in DEFAULT_CMD_PER_LANGUAGE:
            continue
        if skip is not None:
            continue
        if setup is not None:
            code = Template(setup).substitute(PLACEHOLDER=code)
        if copy_destination is not None:
            copy_destination = temp_folder / copy_destination
            copy_destination.parent.mkdir(parents=True, exist_ok=True)
            log.info("🖇️ Creating file copy: %s", copy_destination)
            if cwd is not None:
                cwd = temp_folder / cwd
        code_file_name = None
        with get_file_object(
            file_name=copy_destination, language=language
        ) as code_file:
            code_file.write(bytes(code, encoding="utf-8"))
            code_file_name = code_file.name
            if not cwd:
                cwd = Path(code_file.name).parent
        if not cmd:
            if copy_destination is not None:
                # We just want to copy the file, not run the command here
                continue
            cmd = DEFAULT_CMD_PER_LANGUAGE[language]
        cmd = Template(cmd).substitute(FILENAME=code_file_name)
        log.info("🤞  Validating with command: %s", cmd)
        result = run_command(
            command=cmd,
            timeout=20,
            cwd=cwd,
        )
        if result.status != 0:
            highlighted_code = Syntax(code, "c++", line_numbers=True)
            text = Padding(
                Text(
                    "❌ Failed to compile file {} ❌".format(code_file_name),
                    style="bold red",
                    justify="center",
                ),
                1,
            )
            code_panel = Panel(highlighted_code, title="Snippet code")
            error_panel = Panel.fit(
                Syntax(result.stderr, "gdscript", line_numbers=False),
                title="Error",
                style="red",
            )
            print(Padding(Panel.fit(Group(text, code_panel, error_panel)), 1))
            error_count += 1
    return error_count


def get_all_files(path: Path, suffix: str):
    return [file for file in path.iterdir() if file.suffix == suffix]


def get_all_changed_files(path: Path, suffix: str):
    git_command = """
    {
        git diff HEAD origin/main --name-only;
        git diff HEAD origin/main --name-only --staged;
        git diff --name-only;
        git diff --name-only --staged;
    } | sort | uniq"""
    result = run_command(command=git_command, timeout=20, cwd=path)
    files = [
        path / file_name for file_name in result.stdout.split("\n") if file_name.strip()
    ]
    print(
        Padding(
            Panel.fit(
                Pretty(files),
                title="Files changed compared to origin/main",
                subtitle="Only selecting markdown files from these",
            ),
            1,
        )
    )
    return [file for file in files if file.suffix == suffix]


def main(
    changes_only: bool = typer.Option(
        False,
        help="Only run on changed files.",
        rich_help_panel="Customization and Utils",
    ),
    project_folder: str = typer.Option(
        ..., help="Project folder.", rich_help_panel="Customization and Utils"
    ),
):
    regex_pattern = re.compile(REGEX_TEMPLATE, flags=re.VERBOSE | re.MULTILINE)
    lectures_dir = Path(project_folder) / "lectures"
    error_count = 0
    if changes_only:
        files = get_all_changed_files(Path(project_folder), ".md")
    else:
        files = get_all_files(lectures_dir, ".md")

    for file in files:
        log.info("ℹ️ Processing file: %s", file)
        error_count += compile_all_snippets(regex_pattern=regex_pattern, file=file)
    if error_count == 0:
        print(
            Padding(
                Panel(
                    Padding(
                        Text(
                            "All snippets compiled successfully!",
                            justify="center",
                        ),
                        1,
                    ),
                    style="green bold",
                ),
                1,
            )
        )
    else:
        text = Text(
            "{} snippets did not compile! 😢".format(error_count),
            style="bold",
            justify="center",
        )
        error = Padding(
            Panel(Padding(text, 1), title="Errors encountered", style="red"), 1
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    typer.run(main)
