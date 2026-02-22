---
'create-seed': patch
---

Run biome format after rename step to fix lint errors from reference renaming

Previously, biome was only run after the package.json rewrite step. The rename
step runs after and modifies files again (replacing package name references in
dependencies and imports), which could break biome's sort rules. Now biome runs
once after all file modifications are complete.
