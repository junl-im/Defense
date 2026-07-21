#!/usr/bin/env python3
"""Legacy entrypoint. The project art direction moved to SD mobile toon in v3.1.0."""
from generate_sd_toon_models import guardian_ember, monster_imp, boss_tiger, export

if __name__ == '__main__':
    export(guardian_ember(), 'guardian-ember-sd-toon.glb')
    export(monster_imp(), 'monster-imp-sd-toon.glb')
    export(boss_tiger(), 'boss-tiger-sd-toon.glb')
