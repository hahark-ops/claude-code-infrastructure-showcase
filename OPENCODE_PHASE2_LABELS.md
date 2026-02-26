# Phase 2 Violation Labeling Sheet

Use this sheet to classify each violation as true positive or false positive during shadow burn-in.

## Labeling Legend

- `TP`: true positive (rule fired correctly)
- `FP`: false positive (rule fired incorrectly)
- `UNCLEAR`: needs team review

## Violation Rows

| session | skill | enforcement | path | action | source | label | notes |
|---|---|---|---|---|---|---|---|
| s11 | frontend-dev-guidelines | block | src/App.tsx | enforce | tool.execute.before | UNCLEAR | legacy enforce validation run |
| recheck2 | frontend-dev-guidelines | block | src/App.tsx | enforce | tool.execute.before | UNCLEAR | legacy enforce validation run |
| phase2-shadow-1 | frontend-dev-guidelines | block | src/App.tsx | shadow | tool.execute.before | UNCLEAR | component edit scenario |
| phase2-shadow-3 | frontend-dev-guidelines | block | components/Button.tsx | shadow | tool.execute.before | UNCLEAR | component edit scenario |
| phase2-real-frontend-2 | frontend-dev-guidelines | block | src/components/Modal.tsx | shadow | tool.execute.before | UNCLEAR | modal UI scenario |

## KPI Formula

- `false_positive_rate = FP / (TP + FP)`
- `block_hit_rate = block violations / total sessions`
- `stop_check_pass_rate = successful stop checks / total stop checks`
