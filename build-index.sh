#!/bin/bash
cd "$(dirname "$0")"
ls assets/modules/*.*m* 2>/dev/null | while read f; do basename "$f"; done | sort | python3 -c "
import sys, json
files = [l.strip() for l in sys.stdin]
print(json.dumps(files))
" > assets/modules/index.json
echo "Generated assets/modules/index.json"
