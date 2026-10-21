"""Regenerate documentation inventories from local source; never reads env files."""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
BACKEND = ROOT.parent / "ecom-backend"


def link(path):
    import os
    return Path(os.path.relpath(path, HERE)).as_posix()


def chapter(route):
    if route == "team-login":
        return "roles.md"
    if route.startswith("admin"):
        return "administration.md"
    if route.startswith(("store-manager", "delivery")):
        return "operations.md"
    if route.startswith(("checkout", "payment", "order", "tracking")):
        return "commerce.md"
    return "customer.md"


router = (ROOT / "src/router.jsx").read_text(encoding="utf-8")
routes = re.findall(r'path:\s*["\']([^"\']*)["\']', router)
rows = [
    "# Coverage and source inventory\n",
    "Generated from the local source on the documentation baseline. Every declared router path is included; wildcard admin subpages are expanded separately. Inventory presence is not runtime verification.\n",
    "## Declared routes\n",
    "| Route | Functional chapter |",
    "|---|---|",
]
for route in routes:
    display = "/" + route.lstrip("/")
    rows.append(f"| `{display}` | [{chapter(route).removesuffix('.md')}]({chapter(route)}) |")

access = (ROOT / "src/config/accessControl.js").read_text(encoding="utf-8")
workspace = (ROOT / "src/pages/AdminWorkspace/AdminWorkspace.jsx").read_text(encoding="utf-8")
modules = re.search(r"const modules = \[(.*?)\];", workspace).group(1)
module_names = re.findall(r"'([^']+)'", modules)
rows += ["", "## Admin wildcard modules", "",
         "All modules below are documented in [administration](administration.md); role lists are in [roles](roles.md).", ""]
rows += [f"- `/admin/{name}`" for name in module_names]
rows += [
    "- `/admin/orders/assign/:orderId` — local global stocked-store assignment.",
    "- `/admin/orders/delivery/:orderId` — backend partner assignment.",
    "", "## Page and nested workspace source files", "",
    "This inventory includes components without a top-level route. `OrdersHistoryPage` has no direct current router import; Register is a Login wrapper. Nested admin/store pages are reached through workspace logic.", "",
    "| Source | Functional chapter |", "|---|---|",
]
pages = sorted((ROOT / "src/pages").rglob("*.jsx"))
for page in pages:
    name = page.as_posix()
    if "/AdminWorkspace/" in name:
        doc = "administration.md"
    elif "/StoreManager/" in name or "/Delivery" in name or "/RoleLoginPage/" in name:
        doc = "operations.md" if "/RoleLoginPage/" not in name else "roles.md"
    elif any(word in page.name for word in ("Order", "Checkout", "Payment")):
        doc = "commerce.md"
    else:
        doc = "customer.md"
    rows.append(f"| [{page.relative_to(ROOT).as_posix()}]({link(page)}) | [{doc.removesuffix('.md')}]({doc}) |")

rows += ["", "## Service adapters and functional utilities", "",
         "Exported names aid traceability; an export may be dormant or internal. Business descriptions and limitations remain authoritative in the chapters.", "",
         "| Source | Exported symbols |", "|---|---|"]
for folder in ("src/services", "src/utils"):
    for path in sorted((ROOT / folder).glob("*.js")):
        if path.name.endswith(".test.js"):
            continue
        source = path.read_text(encoding="utf-8")
        names = re.findall(r"export\s+(?:async\s+)?(?:const|function|class)\s+(\w+)", source)
        rows.append(f"| [{path.relative_to(ROOT).as_posix()}]({link(path)}) | {', '.join('`' + name + '`' for name in names) or 'See source'} |")
rows += ["", "## Shared UI components", "",
         "Components may serve multiple routes or local/demo presentations. Do not treat every component as a separately enabled feature.", ""]
for path in sorted((ROOT / "src/components").rglob("*.jsx")):
    rows.append(f"- [{path.relative_to(ROOT).as_posix()}]({link(path)})")
rows += ["", "## Coverage totals", "", f"- Declared router paths: {len(routes)}.",
         f"- Admin module names: {len(module_names)}.",
         f"- Page/workspace JSX files: {len(pages)}.", ""]
(HERE / "coverage.md").write_text("\n".join(rows), encoding="utf-8")

rows = [
    "# Backend endpoint inventory\n",
    "Generated controller mapping/authorization annotations from the sibling backend source. Entries preserve declared annotations instead of guessing fully composed URLs. Class `RequestMapping` supplies a prefix; method mappings supply suffixes. Authorization can also be enforced in service/access classes, gateway filters and global security configuration.\n",
    "This is an implementation appendix, not a promise that every endpoint is exposed in a user workflow or that all controller internals were runtime-tested.\n",
]
controllers = sorted(BACKEND.glob("*/src/main/java/**/*Controller.java"))
for path in controllers:
    source = path.read_text(encoding="utf-8")
    pattern = r'''@(?:[\w.]+\.)?(?:RequestMapping|GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping|PreAuthorize)\b\s*(?:\((?:[^()"']|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')*\))?'''
    annotations = [
        (source.count("\n", 0, match.start()) + 1, match.group().strip())
        for match in re.finditer(pattern, source)
    ]
    if not annotations:
        continue
    rows += [f"## {path.parts[len(BACKEND.parts)]}: {path.stem}", "",
             f"Source: [{path.name}]({link(path)}).", "", "```java"]
    rows += [f"// line {number}\n{annotation}" for number, annotation in annotations]
    rows += ["```", ""]
(HERE / "backend-endpoints.md").write_text("\n".join(rows), encoding="utf-8")
print(f"Generated coverage for {len(routes)} routes, {len(module_names)} admin modules, "
      f"{len(pages)} page files; inventoried {len(controllers)} backend controllers.")
