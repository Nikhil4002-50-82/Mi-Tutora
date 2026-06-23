import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all inputs/textareas with name="xxx" and onChange={handleChange}
    # and add value={formData.xxx} if not already present.
    def replacer(match):
        name = match.group(1)
        # some names might not match formData perfectly, but let's check
        # formData.fullName, formData.phone, etc.
        # if name is "classGrade", formData has "classGrade", etc.
        # wait, radio buttons also have name="gender" but they shouldn't get value={formData.gender}.
        # but radio buttons have value={item} instead.
        if 'type="radio"' in match.group(0):
            return match.group(0) # don't modify radios
        
        # Check if value={ is already there
        if 'value={' in match.group(0):
            return match.group(0)

        # insert value={formData.name} before onChange={handleChange}
        # wait, match.group(0) is the entire tag up to onChange
        return match.group(0).replace('onChange={handleChange}', f'onChange={{handleChange}}\n              value={{formData.{name}}}')

    # This regex is a bit complex. Let's just do it manually for the known fields.
    fields = ['fullName', 'phone', 'whatsapp', 'email', 'address', 'studentType', 'classGrade', 'board', 'subjects', 'parentName', 'hours', 'days', 'goal', 'requirements', 'budget', 'qualification', 'experience']

    for field in fields:
        # replace name="field" \n placeholder="xxx" \n onChange={handleChange}
        pattern = r'(name="' + field + r'"[\s\S]*?onChange=\{handleChange\})'
        def repl(m):
            if 'value={' in m.group(1): return m.group(1)
            return m.group(1).replace('onChange={handleChange}', f'value={{formData.{field}}}\n              onChange={{handleChange}}')
        content = re.sub(pattern, repl, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file(r"c:\Users\Dell\Desktop\mushi\web\src\components\DemoForm.tsx")
fix_file(r"c:\Users\Dell\Desktop\mushi\web\src\components\TeacherForm.tsx")
