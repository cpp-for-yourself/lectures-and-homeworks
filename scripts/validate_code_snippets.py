import re
import sys
import logging
import tempfile
from os import environ, killpg
from pathlib import Path
from string import Template
from signal import SIGINT
from typing import Union, List, Optional, Mapping, Any
from subprocess import PIPE, Popen, TimeoutExpired, CalledProcessError, CompletedProcess

logging.basicConfig()
log = logging.getLogger("code_validation")
log.setLevel(logging.INFO)

# See a playground here: https://regex101.com/r/wtt7AA/1
REGEX_TEMPLATE = r"""
(?:\s*
<!--                                  # Start of html comment
    (:?\s*`CPP_SETUP_START`\n         # Start of the setup
        (?P<setup>(?:[^`]+)\n)\s*     # Actual setup contents
    `CPP_SETUP_END`\s*)*\s*           # End of the setup
    (?P<skip>`CPP_SKIP_SNIPPET`)*\s*  # Skip the snippet if needed
-->\s*)*                              # End of html comment and some whitespace
```cpp\s*                             # Start of cpp snippet
    (?P<code>(?:[^`]+)\n)+\s*         # Actual cpp snippet code
```\s*                                # End of cpp snippet
"""


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
            shell=False,
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


def compile_all_snippets(regex_pattern, file):
    error_count = 0
    CMD = ["c++", "-std=c++17"]
    for match in re.finditer(pattern=regex_pattern, string=file.read_text()):
        found_group_dict = match.groupdict()
        skip = found_group_dict["skip"]
        setup = found_group_dict["setup"]
        code = found_group_dict["code"]
        if skip is not None:
            continue;
        if setup is not None:
            code = Template(setup).substitute(PLACEHOLDER=code)
        with tempfile.NamedTemporaryFile(suffix=".cpp", delete=False) as temp_code_file:
            temp_code_file.write(bytes(code, encoding="utf-8"))
            temp_code_file.flush()
            result = run_command(
                command=CMD + [temp_code_file.name],
                timeout=20,
                cwd=tempfile.gettempdir(),
            )
            if result.status != 0:
                error_count += 1
                log.error("--------------------------------------------------")
                log.error("Failed to compile snippet:\n%s", code)
                log.error("--------------------------------------------------")
                log.error("stderr:\n%s", result.stderr)
                log.error("==================================================")
    return error_count


def main():
    regex_pattern = re.compile(REGEX_TEMPLATE, flags=re.VERBOSE)
    lectures_dir = Path.cwd() / "lectures"
    error_count = 0
    for file in lectures_dir.iterdir():
        if file.suffix != ".md":
            continue
        log.info("Processing file: %s", file)
        error_count += compile_all_snippets(regex_pattern=regex_pattern, file=file)
    if error_count == 0:
        log.info("All snippets compile successfully!")
    else:
        log.fatal("Errors encountered: %s snippets did not compile!", error_count)
        sys.exit(1)


if __name__ == "__main__":
    main()
