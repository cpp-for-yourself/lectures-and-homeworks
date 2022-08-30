---
marp: true
theme: custom-theme

---

<div class="mermaid">
flowchart TD
    fund[Fundamental\ntypes] --> void
    fund --> bool
    fund --> char[char]
    fund --> integer[Integer\ntypes]
    fund --> floating[Floating\npoint\nnumbers]
    integer ---> signed
    integer --> unsigned
    signed --> int
    signed --> short
    signed --> long
    signed --> llong[long long]
    unsigned --> unsigned\nint
    unsigned --> unsigned\nshort
    unsigned --> unsigned\nlong
    unsigned --> ull[unsigned\nlong long]
    floating --> float
    floating --> double
</div>

<script src="https://unpkg.com/mermaid@8.0.0-rc.8/dist/mermaid.min.js"></script>
  <script>
    mermaid.initialize({
      theme: 'forest'
    });
</script>