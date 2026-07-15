const fs = require('fs');

const ICSE_SUBJECTS = ['English', 'English Language', 'English Literature', 'Second Language', 'Mathematics', 'Environmental Studies (EVS)', 'General Knowledge (GK)', 'Computer', 'Computer Applications', 'Science', 'Integrated Science', 'Physics', 'Chemistry', 'Biology', 'History', 'Civics', 'Geography', 'Art', 'Music', 'Physical Education', 'Moral Science', 'Economics', 'Commercial Studies', 'Yoga', 'Home Science'];
const CBSE_SUBJECTS = ['English', 'Mathematics', 'EVS', 'Hindi/Regional Language', 'Hindi', 'Sanskrit/Third Language', 'Science', 'Social Science', 'Computer', 'Artificial Intelligence/Information Technology', 'Health & Physical Education', 'Skill Subjects', 'Art', 'Physical Education'];
const STATE_BOARD_SUBJECTS = ['Kannada', 'English', 'Hindi/Third Language', 'Mathematics', 'EVS', 'Science', 'Social Science', 'Computer', 'Art', 'Physical Education'];

let content = fs.readFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\components\\\\TeacherForm.tsx', 'utf8');

// 1. Qualification dropdown
const qualStr = `          <div>
            <label className="block text-sm font-semibold mb-2">
              🎓 Highest Qualification *
            </label>

            <input
              type="text"
              name="qualification"
              placeholder="Enter qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>`;
          
const newQualStr = `          <div>
            <label className="block text-sm font-semibold mb-2">
              🎓 Highest Qualification *
            </label>

            <select
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
            </select>
          </div>`;
content = content.replace(qualStr, newQualStr);

// 2. Occupation text box
const occStr = `        {/* OCCUPATION */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            💼 Current Occupation
          </label>

          <div className="grid md:grid-cols-2 gap-3">

            {[
              'Freelancer',
              'Full-Time Teacher',
              'Student',
              'Others',
            ].map((item) => (

              <label
                key={item}
                className="border border-slate-300 rounded-xl px-4 py-4 flex items-center gap-3 hover:border-emerald-500 transition-all"
              >

                <input
                  type="radio"
                  name="occupation"
                  value={item}
                  checked={formData.occupation === item}
                  onChange={handleChange}
                />

                {item}

              </label>

            ))}

          </div>
        </div>`;

const newOccStr = `        {/* OCCUPATION */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            💼 Current Occupation
          </label>
          <input
            type="text"
            name="occupation"
            placeholder="e.g. Full-Time Teacher, Software Engineer, Student"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4"
          />
        </div>`;
content = content.replace(occStr, newOccStr);

// 3. Fee range slider
const feeStr = `        {/* FEES */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            💰 Expected Fee Range
          </label>

          <input
            type="text"
            name="feeRange"
            placeholder="Expected monthly fees"
            value={formData.feeRange}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4"
          />
        </div>`;

const newFeeStr = `        {/* FEES */}
        <div>
          <label className="block text-sm font-semibold mb-2 flex justify-between">
            <span>💰 Expected Fee Range (Monthly)</span>
            <span className="text-emerald-600 font-bold">₹{formData.feeRange || 1000}</span>
          </label>

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
          </div>
        </div>`;
content = content.replace(feeStr, newFeeStr);


// 4. Subjects checkbox based on boards
const subjectsStr = `            {/* SUBJECTS */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                📘 Subjects you Teach
              </label>

              <input
                type="text"
                name="subjects"
                placeholder="Maths, Science, English"
                value={formData.subjects}
              onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
              />
            </div>`;

const newSubjectsStr = `            {/* SUBJECTS */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                📘 Subjects you Teach
              </label>
              
              {formData.boards.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">Please select at least one board below to see the subjects.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-3">
                  {(() => {
                    let availableSubjects = new Set();
                    if (formData.boards.includes('ICSE')) {
                      [${ICSE_SUBJECTS.map(s => `'${s}'`).join(', ')}].forEach(s => availableSubjects.add(s));
                    }
                    if (formData.boards.includes('CBSE')) {
                      [${CBSE_SUBJECTS.map(s => `'${s}'`).join(', ')}].forEach(s => availableSubjects.add(s));
                    }
                    if (formData.boards.includes('State Board') || formData.boards.includes('IB / IGCSE')) {
                      [${STATE_BOARD_SUBJECTS.map(s => `'${s}'`).join(', ')}].forEach(s => availableSubjects.add(s));
                    }
                    return Array.from(availableSubjects).sort().map(sub => (
                      <label
                        key={sub}
                        className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-3 hover:border-emerald-500 transition-all cursor-pointer"
                      >
                        <input 
                          type="checkbox" 
                          checked={formData.subjects.includes(sub)}
                          onChange={() => {
                            setFormData((prev) => {
                              const subjectsArray = prev.subjects ? prev.subjects.split(',').map(s => s.trim()).filter(Boolean) : [];
                              if (subjectsArray.includes(sub)) {
                                return { ...prev, subjects: subjectsArray.filter(s => s !== sub).join(', ') };
                              } else {
                                return { ...prev, subjects: [...subjectsArray, sub].join(', ') };
                              }
                            });
                          }}
                          className="accent-emerald-500"
                        />
                        <span className="text-sm font-medium">{sub}</span>
                      </label>
                    ));
                  })()}
                </div>
              )}
            </div>`;

content = content.replace(subjectsStr, '');

const boardsStr = `            {/* BOARD */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                📚 Preferred Teaching Board
              </label>

              <div className="grid md:grid-cols-2 gap-3">

                {[
                  'CBSE',
                  'ICSE',
                  'State Board',
                  'IB / IGCSE',
                ].map((item) => (

                  <label
                    key={item}
                    className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-4"
                  >

                    <input 
                      type="checkbox" 
                      checked={formData.boards.includes(item)}
                      onChange={() => handleCheckboxChange('boards', item)}
                    />

                    {item}

                  </label>

                ))}

              </div>
            </div>`;

const newBoardsAndSubjectsStr = boardsStr + '\\n\\n' + newSubjectsStr;
content = content.replace(boardsStr, newBoardsAndSubjectsStr);

// 5. Hide Address if Online
const addressStr = `          <div className="space-y-4">
            <label className="block text-sm font-semibold mb-2">🏠 Residential Address *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <input
                  type="text"
                  name="street"
                  placeholder="Street / Locality"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                  required
                />
              </div>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
                required
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
                required
              />
            </div>
          </div>`;

const newAddressStr = `          {formData.mode !== 'Online' && (
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
content = content.replace(addressStr, newAddressStr);

fs.writeFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\components\\\\TeacherForm.tsx', content);
console.log('TeacherForm updated successfully.');
