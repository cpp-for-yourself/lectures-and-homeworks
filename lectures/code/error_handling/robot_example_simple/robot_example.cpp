#include <cassert>
#include <iostream>
#include <vector>

// Can be arbitrary types, here int for simplicity.
using Robot = int;
using Mission = int;

// This should be a class, using struct for simplicity.
struct MissionRobotAssignments {

  void AssignRobot(int assignment_index, const Robot& robot) {
    assert((assignment_index < robots.size()) && (assignment_index >= 0));
    robots[assignment_index] = robot;
  }

  void Print() const {
    assert(robots.size() == missions.size());
    for (auto i = 0UL; i < robots.size(); ++i) {
      std::cout << i << ": Mission " <<                      //
          missions[i] << " is carried out by the robot " <<  //
          robots[i] << std::endl;
    }
  }

  std::vector<Mission> missions{};
  std::vector<Robot> robots{};
};

// Multiple issues here for now.
// We should handle failure to get a proper value.
// We also could use a struct in place of a pair.
std::pair<int, int> GetNextChangeEntryFromUser(
    const MissionRobotAssignments& assignments) {
  std::pair<int, int> entry{};
  std::cout << "Please select mission index." << std::endl;
  std::cin >> entry.first;
  std::cout << "Please provide new robot id." << std::endl;
  std::cin >> entry.second;
  return entry;
}

bool CheckIfUserWantsChanges() {
  std::cout << "Do you want to change assignment? [y/n]" << std::endl;
  std::string answer{};
  std::cin >> answer;
  if (answer == "y") { return true; }
  return false;
}

int main() {
  MissionRobotAssignments assignments{{Mission{42}, Mission{40}},
                                      {Robot{10}, Robot{23}}};
  assignments.Print();
  while (true) {
    const auto user_wants_changes = CheckIfUserWantsChanges();
    if (!user_wants_changes) { break; }
    const auto change_entry = GetNextChangeEntryFromUser(assignments);
    assignments.AssignRobot(change_entry.first, change_entry.second);
  }
  assignments.Print();

  std::cout << "Address of assignments.missions.data(): "
            << assignments.missions.data() << std::endl;
  std::cout << "Address of assignments.robots.data(): "
            << assignments.robots.data() << std::endl;
  const auto diff = assignments.robots.data() - assignments.missions.data();
  std::cout << "Diff in address: " << diff << std::endl;
}
