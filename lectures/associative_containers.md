---
marp: true
math: katex
theme: custom-theme
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Associative containers

#### Today:
- `std::map`
- `std::unordered_map`
- `std::set`
- `std::unordered_set`

### 📺 Watch the related [YouTube video](https://youtu.be/TCu76SYmVCg)! 

---
# Special symbols used in slides
- 🎨 - Style recommendation
- 🎓 - Software design recommendation
- 😱 - **Not** a good practice! Avoid in real life!
- ✅ - Good practice!
- ❌ - Whatever is marked with this is wrong
- 🚨 - Alert! Important information!
- 💡 - Hint or a useful exercise
- 🔼1️⃣7️⃣ - Holds for this version of C++(here, `17`) and **above**
- 🔽1️⃣1️⃣ - Holds for versions **until** this one C++(here, `11`)

Style (🎨) and software design (🎓) recommendations mostly come from [Google Style Sheet](https://google.github.io/styleguide/cppguide.html) and the [CppCoreGuidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)

---
# Use `std::map` to store ordered data in a tree-like structure
- `#include <map>` to use [`std::map`](https://en.cppreference.com/w/cpp/container/map)
- Stores items under **unique keys**
- Implemented _usually_ as a **Red-Black tree** (not guaranteed)
- Key can be any type with operator `<` defined
- By default takes two template parameters:
  <!-- 
  `CPP_SETUP_START`
  #include <map>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  std::map<char, double> map_default{};
  ```
- We can also use `>` operator by creating the map like this:
  <!-- 
  `CPP_SETUP_START`
  #include <map>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  std::map<int, float, std::greater<int>> map_greater{};
  ```
- Access, add, remove data in $\mathcal{O}(\log{}n)$
  
---
# Add data to `std::map`
- We can create a map from data:
  <!-- 
  `CPP_SETUP_START`
  #include <map>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  const std::map<int, double> map_explicit = {{42, 42.42}};
  ```
- 🔼1️⃣7️⃣
  <!-- 
  `CPP_SETUP_START`
  #include <map>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  const std::map map_implicit = {std::pair{42, 42.42}};
  ```
- Add item to map: `my_map.emplace(key, value);`
- Get (`const`) reference to an item: `my_map.at(key);`
- Modify or add item: `my_map[key] = value;`
- :rotating_light: Operator `[]` **doesn't work** on `const` maps!
- Check if key is present: `my_map.count(key) > 0;`
- Check size: `my_map.size();`
- Check if empty: `my_map.empty();`
- Clear the map: `my_map.clear();`
- Erase key: `my_map.erase(key);`

---

# Example using `std::map`
```cpp
#include <iostream>
#include <map>
using std::cout;
using std::endl;

int main() {
  const std::map<int, double> const_map = {{42, 42.42},
                                           {23, 23.23}};
  // Work with a const map
  cout << "Map is empty: " << const_map.empty() << endl;
  cout << "Map size: " << const_map.size() << endl;
  cout << const_map.at(42) << endl;
  // Work with a mutable map
  std::map mutable_map = {std::pair{42, 42.42},
                          std::pair{23, 23.23}};
  cout << "Map size: " << mutable_map.size() << endl;
  mutable_map[4242] = 23.42;  // Creates a new key-value pair
  cout << "New map size: " << mutable_map.size() << endl;
  cout << mutable_map.at(4242) << endl;
  mutable_map.at(4242) = 42.42;  // Ref to an existing value
  cout << mutable_map.at(4242) << endl;
  mutable_map.erase(4242);
  cout << mutable_map.size() << endl;
}
```
---
# Use `std::unordered_map` to store unordered data
- 🔼1️⃣1️⃣ `#include <unordered_map>`
  to use [`std::unordered_map`](https://en.cppreference.com/w/cpp/container/unordered_map)
- Serves same purpose as `std::map` but is implemented as a **hash table** and not a tree
- Key type has to be **hashable** (all fundamental types are)
- **Exactly** same interface as `std::map`
- Access, add, remove data in $\mathcal{O}(1)$
- 💡 If you care about performance use `std::map` when you have small amount of data and `std::unordered_map` when you have a lot of data (but really, best is to **measure**)

---
# 🔼1️⃣7️⃣ Merge maps
- Calling `map1.merge(map2)` allows to merge maps:
  - Elements of `map2` not in `map1` are added to `map1`
  - Elements of `map2` with keys already in `map1` are ignored
- Works for both: `std::map` and `std::unordered_map`:
- 
  <!-- 
  `CPP_SETUP_START`
  #include <string>
  #include <map>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  std::map<std::string, int> map1{
      {"A", 1}, {"B", 2}, {"C", 3}};
  std::map<std::string, int> map2{
      {"A", 4}, {"B", 2}, {"D", 4}};
  map1.merge(map2);
  ```
  <!-- 
  `CPP_SETUP_START`
  #include <string>
  #include <unordered_map>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  std::unordered_map<std::string, int> map1{
      {"A", 1}, {"B", 2}, {"C", 3}};
  std::unordered_map<std::string, int> map2{
      {"A", 4}, {"B", 2}, {"D", 4}};
  map1.merge(map2);
  ```
- ✅ Try it out yourself to see the results!

---
# Use sets to store keys only
- If you don't have key-value pairs, but just keys that you'd like to be unique, use [`std::set`](https://en.cppreference.com/w/cpp/container/set) and [`std::unordered_set`](https://en.cppreference.com/w/cpp/container/unordered_set)
- Where maps store pairs, sets store values directly
- Otherwise, all interfaces are analogous to maps' ones
- ✅ Try it out yourself to see the results!
- 💡 Get used to using cppreference.com to figure out interfaces (PS, types are clickable above :wink:)
---
# :scream: Do not use floating point numbers as keys!

Operations on floating point numbers might result in loss of precision, changing your keys!

```cpp
#include <iostream>
#include <map>
using std::cout;
using std::endl;
int main() {
  std::map<float, int> blah;  // 😱
  float num = 42.42F;
  blah[num] = 42;
  num += 424242.4242F;
  num -= 424242.4242F;
  std::cout << blah.at(num) << std::endl;
}
```
We will cover the reason behind this in a later video!

---

![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)