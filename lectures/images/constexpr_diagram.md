<div class="mermaid">
flowchart LR
    expr -->|Yes| constexpr_select["✅ Use constexpr"]
    expr{Can you \ndeclare it as \n constexpr?} -->|No| const{Can you\n declare it\n as const?}
    const -->|Yes| const_select["✅ Use const"]
    const -->|No| normal["✅ Use normal variable"]
</div>