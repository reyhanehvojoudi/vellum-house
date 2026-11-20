#!/usr/bin/env python3
"""Prevents the obsolete generator from overwriting the approved V7.1 atlas."""
raise SystemExit(
    'V7.1 is maintained in the delivered HTML, CSS and JS files directly. '\
    'The older generator is preserved in tools/legacy for archival reference, '\
    'but running it would overwrite the interactive atlas. Do not run it.'
)
