import itertools
import os
import re
from collections.abc import Iterable


def flatten(xs):
    for x in xs:
        if isinstance(x, Iterable) and not isinstance(x, (str, bytes)):
            yield from flatten(x)
        else:
            yield x


def camel_case_split(identifier):
    matches = re.finditer(
        ".+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)", identifier
    )
    return [m.group(0) for m in matches]


def hasDigit(s):
    for x in s:
        if x.isdigit():
            return True
    return False


# def flatten(xss):
#     c = []
#     for x in xss:
#         if isinstance(x, str):
#             c.append(x)
#         else:
#             for y in x:
#                 c.append(y)
#     return c


def split_by_first_digit(string: str):
    """Splits a string by the first digit encountered."""
    match = re.search(r"\d", string)
    if match:
        return string[: match.start()], string[match.start() :]
    return string


def tranform(data: str):
    words = camel_case_split(data)  # [rss,icon]
    lowered = map(lambda x: split_by_first_digit(x.lower()), words)  # []
    c = list(lowered)
    lowered = flatten(c)
    return "-".join(lowered).replace("-icon", "").replace("--", "-")


print(tranform("RssIcon"))


def update_imports(file_path):
    with open(file_path, "r", encoding="utf8") as file:
        content = file.read()

    # Regular expression to match Lucide Svelte imports
    pattern = r'import\s*{([^}]+)}\s*from\s*[\'"]lucide-svelte[\'"]'

    def replace_import(match):
        icons = [icon.strip() for icon in match.group(1).split(",")]
        new_imports = []
        for icon in icons:
            print(icon)
            # Handle cases like "Calendar as CalendarIcon"
            if " as " in icon:
                original, alias = icon.split(" as ")
                new_imports.append(
                    f"import {alias.strip()} from 'lucide-svelte/icons/{tranform(original.strip())}'"
                )
            else:
                new_imports.append(
                    f"import {icon} from 'lucide-svelte/icons/{tranform(icon.strip())}'"
                )
        return "\n".join(new_imports)

    # Replace the imports
    updated_content = re.sub(pattern, replace_import, content)

    # Write the updated content back to the file
    with open(file_path, "w", encoding="utf8") as file:
        file.write(updated_content)


def process_folder(folder_path):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".svelte") or file.endswith(".ts") or file.endswith(".js"):
                file_path = os.path.join(root, file)
                update_imports(file_path)
                print(f"Updated: {file_path}")


# Usage
folder_path = "./src"
process_folder(folder_path)
