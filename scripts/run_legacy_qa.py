"""Run an original pre-v4 browser QA against the unchanged legacy layout.
v4.0 uses a genuinely different screenshot/UI; preserve ALL previous test
assertions rather than deleting them, plus run new v4 tests on default route.
The explicit ?legacy_ui=1 route is also available as a rollback safeguard.
"""
from pathlib import Path
import sys
import runpy

if len(sys.argv)!=2:
    raise SystemExit('usage: python scripts/run_legacy_qa.py scripts/qa_*.py')
path=Path(sys.argv[1])
if not path.is_file() or path.suffix!='.py':
    raise SystemExit('Expected existing Python QA script')
original=path.read_text(encoding='utf-8')
root='http://127.0.0.1:8123/'
if root not in original:
    raise SystemExit(f'QA URL not recognized for explicit legacy layout: {path}')
adapted=original.replace(root,root+'?legacy_ui=1')
# Source code and every assertion are identical. Only the browser URL is
# adjusted for old layout presentation; original game logic stays shared.
namespace={'__name__':'__main__','__file__':str(path),'__package__':None}
sys.argv=[str(path)]
exec(compile(adapted,str(path),'exec'),namespace)
