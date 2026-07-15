const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\components\\\\TeacherForm.tsx', 'utf8');

// Normalize line endings to \n for easier regex
content = content.replace(/\r\n/g, '\n');

// 1. Qualification dropdown
const qualRegex = /<input\s+type="text"\s+name="qualification"\s+placeholder="Enter qualification"\s+value={formData\.qualification}\s+onChange={handleChange}\s+required\s+className="w-full border border-slate-300 rounded-xl px-4 py-4"\s+\/>/m;

const qualReplacement = `<select
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white"
            >
              <option value="">Select Qualification</option>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
              <option value="B.E / B.Tech">B.E / B.Tech</option>
              <option value="B.Sc">B.Sc</option>
              <option value="B.A">B.A</option>
              <option value="B.Com">B.Com</option>
              <option value="M.Sc">M.Sc</option>
              <option value="M.A">M.A</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>`;

content = content.replace(qualRegex, qualReplacement);

// 2. Occupation text box
const occRegex = /<div className="grid md:grid-cols-2 gap-3">\s*\{\[\s*'Freelancer',\s*'Full-Time Teacher',\s*'Student',\s*'Others',\s*\]\.map\(\(item\) => \(\s*<label[\s\S]*?<\/label>\s*\)\)\}\s*<\/div>/m;
const occReplacement = `<input
            type="text"
            name="occupation"
            placeholder="e.g. Full-Time Teacher, Software Engineer, Student"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4"
          />`;

content = content.replace(occRegex, occReplacement);

// 3. Fee range slider
const feeRegex = /<input\s+type="text"\s+name="feeRange"\s+placeholder="Expected monthly fees"\s+value={formData\.feeRange}\s+onChange={handleChange}\s+className="w-full border border-slate-300 rounded-xl px-4 py-4"\s+\/>/m;
const feeReplacement = `<div className="flex justify-between items-center mb-2">
            <span className="text-emerald-600 font-bold">₹{formData.feeRange || 1000}</span>
          </div>
          <input
            type="range"
            name="feeRange"
            min="1000"
            max="20000"
            step="500"
            value={formData.feeRange || 1000}
            onChange={handleChange}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
            <span>₹1,000</span>
            <span>₹20,000</span>
          </div>`;

content = content.replace(feeRegex, feeReplacement);

// 4. Subjects checkbox based on boards AND classes
const subjectsRegex = /<input\s+type="text"\s+name="subjects"\s+placeholder="Maths, Science, English"\s+value={formData\.subjects}\s+onChange={handleChange}\s+className="w-full border border-slate-300 rounded-xl px-4 py-4"\s+\/>/m;

const subjectsReplacement = `{formData.boards.length === 0 || formData.classes.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">Please select at least one class and one board below to see the subjects.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-3">
                  {(() => {
                    let availableSubjects = new Set();
                    
                    const hasEarly = formData.classes.some(c => ['LKG', 'UKG', '1st - 5th'].includes(c));
                    const hasMiddle = formData.classes.some(c => ['6th - 8th'].includes(c));
                    const hasHigh = formData.classes.some(c => ['9th - 10th'].includes(c));
                    const hasPU = formData.classes.some(c => ['1st PU', '2nd PU', 'KCET', 'NEET', 'JEE'].includes(c));

                    if (formData.boards.includes('ICSE')) {
                      if (hasEarly) ['English', 'Second Language', 'Mathematics', 'Environmental Studies (EVS)', 'General Knowledge (GK)', 'Computer', 'Art', 'Music', 'Physical Education', 'Moral Science', 'Science', 'Social Studies'].forEach(s => availableSubjects.add(s));
                      if (hasMiddle) ['English Language', 'English Literature', 'Second Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Integrated Science', 'History', 'Civics', 'Geography', 'Computer Applications', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasHigh) ['English Language', 'English Literature', 'Second Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Civics', 'Geography', 'Computer Applications', 'Physical Education', 'Economics', 'Commercial Studies', 'Yoga', 'Home Science'].forEach(s => availableSubjects.add(s));
                      if (hasPU) ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Accountancy', 'Business Studies', 'Economics'].forEach(s => availableSubjects.add(s));
                    }
                    if (formData.boards.includes('CBSE')) {
                      if (hasEarly) ['English', 'Mathematics', 'EVS', 'Hindi/Regional Language', 'Hindi', 'Computer', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasMiddle) ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Sanskrit/Third Language', 'Computer', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasHigh) ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Artificial Intelligence/Information Technology', 'Health & Physical Education', 'Skill Subjects', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasPU) ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Accountancy', 'Business Studies', 'Economics'].forEach(s => availableSubjects.add(s));
                    }
                    if (formData.boards.includes('State Board') || formData.boards.includes('IB / IGCSE')) {
                      if (hasEarly) ['Kannada', 'English', 'Mathematics', 'EVS', 'Science', 'Social Science', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasMiddle) ['Kannada', 'English', 'Hindi/Third Language', 'Mathematics', 'Science', 'Social Science', 'Computer', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasHigh) ['Kannada', 'English', 'Hindi/Third Language', 'Mathematics', 'Science', 'Social Science', 'Computer', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasPU) ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Accountancy', 'Business Studies', 'Economics'].forEach(s => availableSubjects.add(s));
                    }

                    return Array.from(availableSubjects).sort().map(sub => (
                      <label
                        key={sub}
                        className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-3 hover:border-emerald-500 transition-all cursor-pointer"
                      >
                        <input 
                          type="checkbox" 
                          checked={(formData.subjects || '').split(',').map(s=>s.trim()).includes(sub)}
                          onChange={() => {
                            const subjectsArray = formData.subjects ? formData.subjects.split(',').map(s => s.trim()).filter(Boolean) : [];
                            if (subjectsArray.includes(sub)) {
                              handleChange({ target: { name: 'subjects', value: subjectsArray.filter(s => s !== sub).join(', ') } } as any);
                            } else {
                              handleChange({ target: { name: 'subjects', value: [...subjectsArray, sub].join(', ') } } as any);
                            }
                          }}
                          className="accent-emerald-500"
                        />
                        <span className="text-sm font-medium">{sub}</span>
                      </label>
                    ));
                  })()}
                </div>
              )}`;

content = content.replace(subjectsRegex, subjectsReplacement);


// 5. Hide Address if Online
const addressRegex = /<div className="space-y-4">\s*<label className="block text-sm font-semibold mb-2">🏠 Residential Address \*<\/label>\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">\s*<div className="col-span-1 md:col-span-2">\s*<input\s+type="text"\s+name="street"\s+placeholder="Street \/ Locality"\s+value={formData\.street}\s+onChange={handleChange}\s+className="w-full border border-slate-300 rounded-xl px-4 py-4"\s+required\s+\/>\s*<\/div>\s*<input\s+type="text"\s+name="city"\s+placeholder="City"\s+value={formData\.city}\s+onChange={handleChange}\s+className="w-full border border-slate-300 rounded-xl px-4 py-4"\s+required\s+\/>\s*<input\s+type="text"\s+name="pincode"\s+placeholder="Pincode"\s+value={formData\.pincode}\s+onChange={handleChange}\s+className="w-full border border-slate-300 rounded-xl px-4 py-4"\s+required\s+\/>\s*<\/div>\s*<\/div>/m;

const addressReplacement = `{formData.mode !== 'Online' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold mb-2">🏠 Residential Address {formData.mode !== 'Online' ? '*' : ''}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street / Locality"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-4"
                    required={formData.mode !== 'Online'}
                  />
                </div>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                  required={formData.mode !== 'Online'}
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                  required={formData.mode !== 'Online'}
                />
              </div>
            </div>
          )}`;
content = content.replace(addressRegex, addressReplacement);

// 6. Move Subjects to be AFTER Boards and Classes
// Currently they are: Subjects -> Classes -> Board. We want Classes -> Board -> Subjects.
// We can extract them using regex.
const fullSchoolBlockRegex = /(\{formData\.category ===\('school'\) && \(\s*<>\s*)(\{\/\* SUBJECTS \*\/\}[\s\S]*?)({\/\* CLASSES \*\/\}[\s\S]*?)({\/\* BOARD \*\/\}[\s\S]*?)(<\/>\s*\)\})/;
const match = content.match(fullSchoolBlockRegex);
if (match) {
  const newOrder = match[1] + match[3] + match[4] + match[2] + match[5];
  content = content.replace(fullSchoolBlockRegex, newOrder);
}


fs.writeFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\components\\\\TeacherForm.tsx', content);
console.log('TeacherForm updated successfully with robust regex.');
