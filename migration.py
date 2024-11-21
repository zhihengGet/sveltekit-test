import os
import re
from pathlib import Path


def find_matching_bracket(content, start_pos):
    """Find the position of the matching closing bracket."""
    stack = []
    in_string = False
    string_char = None
    in_comment = False
    i = start_pos

    while i < len(content):
        char = content[i]

        # Handle strings
        if char in "\"'`" and not in_comment:
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char and content[i - 1] != "\\":
                in_string = False

        # Handle comments
        elif char == "/" and i + 1 < len(content):
            if content[i + 1] == "/" and not in_string:
                # Skip to end of line
                while i < len(content) and content[i] != "\n":
                    i += 1
            elif content[i + 1] == "*" and not in_string:
                in_comment = True
                i += 2
                continue
        elif (
            char == "*"
            and i + 1 < len(content)
            and content[i + 1] == "/"
            and in_comment
        ):
            in_comment = False
            i += 2
            continue

        # Handle brackets
        if not in_string and not in_comment:
            if char == "{":
                stack.append(i)
            elif char == "}":
                if stack:
                    if len(stack) == 1:  # Found the matching bracket
                        return i
                    stack.pop()

        i += 1

    return -1


def transform_create_mutation(content):
    """Transform createMutation calls to the new format."""
    pattern = r"createMutation\s*\("

    # Find all createMutation calls
    positions = []
    for match in re.finditer(pattern, content):
        positions.append(match.end())

    # Process matches in reverse to avoid position shifts
    positions.reverse()

    for pos in positions:
        # Find the opening bracket
        bracket_pos = content.find("{", pos)
        if bracket_pos == -1:
            continue

        # Find the matching closing bracket
        closing_pos = find_matching_bracket(content, bracket_pos)
        if closing_pos == -1:
            continue

        # Extract the object content
        object_content = content[bracket_pos : closing_pos + 1]

        # Create the new format
        new_content = "() => { return " + object_content + " }"

        # Replace the content
        content = content[:pos] + new_content + content[closing_pos + 1 :]

    return content


def process_file(file_path):
    """Process a single file."""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Check if file contains createMutation
    if "createMutation" not in content:
        return

    # Transform the content
    new_content = transform_create_mutation(content)

    # Only write if content changed
    if new_content != content:
        print(f"Transforming {file_path}")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)


def main():
    """Main function to process all .js, .ts, and .svelte files in the current directory."""
    extensions = (".ts", ".svelte")

    # Walk through all files in current directory and subdirectories
    for path in Path("./src").rglob("*"):
        if path.is_file() and path.suffix in extensions:
            try:
                print(path.as_posix())
                if "node_modules" not in path.absolute().as_posix():
                    process_file(path)
            except Exception as e:
                print(f"Error processing {path}: {e}")


if __name__ == "__main__":
    main()
