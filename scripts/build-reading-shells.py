#!/usr/bin/env python3
"""Render shared article chrome in HTML, without a client-side layout rebuild."""
import argparse
from html import escape
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def bilingual(copy):
    return "".join(
        f'<span data-language-content="{language}" data-i18n-skip>{escape(copy[language])}</span>'
        for language in ("en", "zh")
    )


def render(article):
    links = []
    for index, chapter in enumerate(article["chapters"]):
        current = ' aria-current="location"' if index == 0 else ""
        links.append(f'<a href="#{escape(chapter["id"], quote=True)}"{current}>{bilingual(chapter)}</a>')
    return {
        "catalog": '<aside class="reading-sidebar" aria-label="Article navigation">\n'
        '<div class="reading-sidebar-sticky">\n'
        '<section class="chapter-catalog" data-reading-catalog>\n'
        f'<h2>{bilingual({"en": "Chapters", "zh": "章节"})}</h2>\n'
        '<nav class="journal-chapters" aria-label="Chapter navigation">\n'
        + "\n".join(links) + '\n</nav>\n</section>\n</div>\n</aside>',
        "hero": f'<header class="reading-hero"><h1>{bilingual(article["title"])}</h1></header>',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    options = parser.parse_args()
    stale = []
    for article in json.loads((ROOT / "assets/data/articles.json").read_text()):
        path = ROOT / article["path"]
        original = path.read_text()
        updated = original
        for component, content in render(article).items():
            pattern = rf'(<!-- reading:{component}:start -->).*?(<!-- reading:{component}:end -->)'
            updated, count = re.subn(pattern, lambda match: f'{match[1]}\n{content}\n{match[2]}', updated, flags=re.S)
            if count != 1:
                raise ValueError(f"Expected one {component} slot in {path}")
        if updated != original:
            stale.append(article["path"])
            if not options.check:
                path.write_text(updated)
    if options.check and stale:
        parser.error("Regenerate article shells: " + ", ".join(stale))


if __name__ == "__main__":
    main()
