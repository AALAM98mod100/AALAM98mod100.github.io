# read all files in _posts directory and generate README.md
import os
import re
import datetime


def get_files():
    files = []
    for root, _, filenames in os.walk("_posts"):
        for f in filenames:
            if f.endswith(".md"):
                files.append(os.path.join(root, f))
    return files


def get_yaml_front_matter_as_dict(f) -> dict:
    with open(f, "r") as file:
        lines = file.readlines()
        if len(lines) == 0:
            return {}
        if lines[0].strip() != "---":
            return {}
        i = 1
        while i < len(lines) and lines[i].strip() != "---":
            i += 1
        if i == len(lines):
            return {}
        yaml_lines = lines[1:i]
        yaml_str = "".join(yaml_lines)
        yaml_str = yaml_str.replace("```", "")
        yaml_str = yaml_str.replace("---", "")
        yaml_str = yaml_str.strip()

        yaml_dict = {}
        for line in yaml_str.split("\n"):
            key, value = line.split(":")
            yaml_dict[key.strip()] = value.strip().strip('"')
        return yaml_dict


def extract_date_from_filename(f):
    date = re.search(r"\d{4}-\d{2}-\d{2}", f)
    if date:
        date = date.group()
        date = datetime.datetime.strptime(date, "%Y-%m-%d")
        return date.strftime("%B %d, %Y")
    return "No date found"


def convert_dict_to_md_table(d):
    """This function gets a dictionary and extracts "| Tags | Title | Date | Private "
    from each of the keys and returns a string with the markdown table.

    Parameters
    ----------
    d : dict
        A dictionary with the keys as file names and values as yaml front matter dictionaries
    """
    md_table = "| Date | Title | Tags | Private |\n"
    md_table += "|------|-------|------|---------|\n"
    for k, v in sorted(d.items(), key=lambda x: x[0], reverse=True):
        tags = v.get("tags", "")
        title = v.get("title", "")
        date = extract_date_from_filename(k)
        private = v.get("private", "False")
        md_table += f" | {date} | {title} | {tags} | {private} |\n"
    return md_table


if __name__ == "__main__":
    files = get_files()
    main_dict = {}
    for file in files:
        yaml_dict = get_yaml_front_matter_as_dict(file)
        if yaml_dict:
            main_dict[file] = yaml_dict
    md_table = convert_dict_to_md_table(main_dict)
    with open("README.md", "w") as file:
        file.write(md_table)
