import React, { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, ExternalLink, Lock, Unlock, Star, MessageSquare } from 'lucide-react';

const ADMIN_PIN = 'ksea2026';
const YELLOW = '#FFD200';
const BLACK = '#1A1A1A';

const SEED_COURSES = [
  {
    id: 'c1',
    title: 'Strategic Workforce Planning',
    provider: 'LinkedIn Learning',
    category: 'People Strategy',
    format: 'Online',
    duration: '2 hours',
    level: 'Intermediate',
    link: 'https://www.linkedin.com/learning/',
    description: 'Frameworks for forecasting talent needs and aligning headcount plans with business strategy.',
    reviews: [
      { id: 'r1', name: 'Ploy, Talent Acquisition', rating: 5, comment: 'Very practical, used the framework in our Q3 planning.', date: '2026-05-20' },
      { id: 'r2', name: 'Tum, C&B', rating: 4, comment: 'Good overview, a bit US-centric in the examples.', date: '2026-05-28' },
    ],
  },
  {
    id: 'c2',
    title: 'Cross-Cultural Communication in Asia-Pacific Teams',
    provider: 'Coursera',
    category: 'Communication',
    format: 'Self-paced',
    duration: '4 weeks',
    level: 'All levels',
    link: 'https://www.coursera.org/',
    description: 'Practical approaches to working across language, hierarchy, and communication norms in regional teams.',
    reviews: [
      { id: 'r3', name: 'Nick, Marketing TH', rating: 5, comment: 'Great for our regional calls, highly recommend.', date: '2026-06-02' },
    ],
  },
  {
    id: 'c3',
    title: 'Compensation & Benefits Fundamentals',
    provider: 'SHRM',
    category: 'Compensation',
    format: 'Online',
    duration: '6 hours',
    level: 'Beginner',
    link: 'https://www.shrm.org/',
    description: 'Core principles of pay structures, benchmarking, and benefits design for HR practitioners.',
    reviews: [],
  },
];

const EMPTY_FORM = {
  title: '', provider: '', category: '', format: 'Online',
  duration: '', level: 'All levels', link: '', description: '',
};

const EMPTY_REVIEW = { name: '', rating: 0, comment: '' };

function avgRating(reviews) {
  if (!reviews || reviews.length === 0) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

function Stars({ value, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={value >= i ? YELLOW : 'none'}
          color={value >= i ? BLACK : '#C9C9C9'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} className="p-0.5">
          <Star size={22} fill={value >= i ? YELLOW : 'none'} color={value >= i ? BLACK : '#C9C9C9'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

function Ribbon({ children }) {
  return (
    <div
      className="absolute -top-3 left-4 px-3 py-1 text-[10px] sm:text-xs font-mono uppercase tracking-wide font-medium"
      style={{
        backgroundColor: BLACK,
        color: YELLOW,
        clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%)',
        paddingRight: '18px',
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [detailId, setDetailId] = useState(null);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const result = {value: localStorage.getItem('ksea-training-courses')};
        if (result && result.value) {
          setCourses(JSON.parse(result.value));
        } else {
          setCourses(SEED_COURSES);
          localStorage.setItem('ksea-training-courses', JSON.stringify(SEED_COURSES));
        }
      } catch (e) {
        setCourses(SEED_COURSES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(next) {
    setCourses(next);
    try {
      localStorage.setItem('ksea-training-courses', JSON.stringify(next));
      setSaveError('');
    } catch (e) {
      setSaveError('Save failed. Your change may not persist for others.');
    }
  }

  function tryUnlock() {
    if (pinValue === ADMIN_PIN) {
      setIsAdmin(true);
      setShowPin(false);
      setPinValue('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Try again.');
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(course) {
    setForm({ ...course });
    setEditingId(course.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function saveForm() {
    if (!form.title.trim() || !form.provider.trim() || !form.category.trim()) return;
    if (editingId) {
      await persist(courses.map((c) => (c.id === editingId ? { ...c, ...form, id: editingId } : c)));
    } else {
      await persist([...courses, { ...form, id: 'c' + Date.now(), reviews: [] }]);
    }
    closeForm();
  }

  async function removeCourse(id) {
    await persist(courses.filter((c) => c.id !== id));
    if (detailId === id) setDetailId(null);
  }

  function openDetail(id) {
    setDetailId(id);
    setReviewForm(EMPTY_REVIEW);
    setReviewError('');
  }

  async function submitReview() {
    if (!reviewForm.name.trim() || reviewForm.rating === 0) {
      setReviewError('Please add your name/department and a star rating.');
      return;
    }
    const review = {
      id: 'r' + Date.now(),
      name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    await persist(courses.map((c) => (c.id === detailId ? { ...c, reviews: [...c.reviews, review] } : c)));
    setReviewForm(EMPTY_REVIEW);
    setReviewError('');
  }

  async function deleteReview(courseId, reviewId) {
    await persist(
      courses.map((c) => (c.id === courseId ? { ...c, reviews: c.reviews.filter((r) => r.id !== reviewId) } : c))
    );
  }

  const categories = ['All', ...Array.from(new Set(courses.map((c) => c.category))).sort()];

  const filtered = courses.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.provider.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const detailCourse = courses.find((c) => c.id === detailId);

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: '#FAFAF7', color: BLACK }}>
      <style>{`
        .font-display { font-family: Arial, Helvetica, sans-serif; font-weight: 700; }
        .font-body { font-family: Arial, Helvetica, sans-serif; }
        .font-mono { font-family: Arial, Helvetica, sans-serif; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: '#EFEAE0' }}>
        <div className="max-w-5xl mx-auto px-5 py-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <img
              src="https://s1.kaercher-media.com/versions/2026.3.0/static/img/kaercher_logo.svg"
              alt="Kärcher logo"
              className="h-9 sm:h-11 object-contain flex-shrink-0"
            />
            <div className="border-l pl-4" style={{ borderColor: '#E0DCC8' }}>
              <h1 className="font-display text-xl sm:text-3xl uppercase tracking-tight leading-tight">Training Index</h1>
              <p className="font-body text-sm mt-1" style={{ color: '#6B6B6B' }}>
                External courses for KSEA staff — rate and review what you've taken
              </p>
            </div>
          </div>
          <button
            onClick={() => (isAdmin ? setIsAdmin(false) : setShowPin(true))}
            className="font-body text-xs sm:text-sm flex items-center gap-1.5 px-3 py-2 rounded-md border whitespace-nowrap"
            style={{
              borderColor: BLACK,
              backgroundColor: isAdmin ? BLACK : YELLOW,
              color: isAdmin ? YELLOW : BLACK,
            }}
          >
            {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
            {isAdmin ? 'Admin mode on' : 'Admin'}
          </button>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-5xl mx-auto px-5 pt-6 pb-2">
        <div className="flex items-center gap-2 border-b-2 pb-3" style={{ borderColor: BLACK }}>
          <Search size={16} color={BLACK} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, providers, topics..."
            className="font-body w-full bg-transparent outline-none text-sm"
            style={{ color: BLACK }}
          />
        </div>
        <div className="flex gap-2 flex-wrap mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="font-body text-xs px-3 py-1.5 rounded-full border-2 transition-colors"
              style={
                activeCategory === cat
                  ? { backgroundColor: BLACK, color: YELLOW, borderColor: BLACK }
                  : { backgroundColor: 'transparent', color: BLACK, borderColor: '#E0DCC8' }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {saveError && (
        <div className="max-w-5xl mx-auto px-5 mt-3">
          <div className="font-body text-xs px-3 py-2 rounded-md" style={{ backgroundColor: '#FBEAEA', color: '#9B3D3D' }}>
            {saveError}
          </div>
        </div>
      )}

      {/* Grid */}
      <main className="max-w-5xl mx-auto px-5 py-8">
        {loading ? (
          <p className="font-body text-sm" style={{ color: '#6B6B6B' }}>Loading the index...</p>
        ) : filtered.length === 0 && !isAdmin ? (
          <div className="text-center py-16">
            <p className="font-display text-lg uppercase" style={{ color: '#6B6B6B' }}>No courses match yet.</p>
            <p className="font-body text-sm mt-1" style={{ color: '#9AA5AE' }}>Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {filtered.map((course) => {
              const avg = avgRating(course.reviews);
              return (
                <div key={course.id} className="relative pt-3">
                  <Ribbon>{course.category}</Ribbon>
                  <div
                    onClick={() => openDetail(course.id)}
                    className="bg-white rounded-lg border-2 p-5 h-full flex flex-col gap-3 cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[4px_6px_0px_0px_rgba(26,26,26,1)] active:translate-y-0 active:shadow-[2px_3px_0px_0px_rgba(26,26,26,1)]"
                    style={{ borderColor: BLACK }}
                  >
                    <div>
                      <h3 className="font-display text-base sm:text-lg uppercase leading-snug">{course.title}</h3>
                      <p className="font-body text-sm mt-1" style={{ color: '#6B6B6B' }}>{course.provider}</p>
                    </div>
                    <p className="font-body text-sm flex-1" style={{ color: '#3A3A3A' }}>{course.description}</p>
                    <div className="font-mono text-xs flex gap-3 flex-wrap" style={{ color: '#9AA5AE' }}>
                      <span>{course.format}</span>
                      <span>·</span>
                      <span>{course.duration}</span>
                      <span>·</span>
                      <span>{course.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {avg ? (
                        <>
                          <Stars value={Math.round(avg)} />
                          <span className="font-mono text-xs" style={{ color: '#6B6B6B' }}>
                            {avg.toFixed(1)} ({course.reviews.length})
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-xs" style={{ color: '#C9C2B4' }}>No reviews yet</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#EFEAE0' }}>
                      <div className="flex items-center gap-4">
                        {course.link ? (
                          <a href={course.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="font-body text-sm flex items-center gap-1.5 font-medium">
                            Open course <ExternalLink size={13} />
                          </a>
                        ) : (
                          <span className="font-body text-sm" style={{ color: '#C9C2B4' }}>No link</span>
                        )}
                        <span className="font-body text-sm flex items-center gap-1.5 font-medium" style={{ color: '#6B6B6B' }}>
                          <MessageSquare size={13} /> Reviews
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openEdit(course); }} className="p-1.5 rounded-md border" style={{ borderColor: '#E0DCC8', color: '#6B6B6B' }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); removeCourse(course.id); }} className="p-1.5 rounded-md border" style={{ borderColor: '#E0DCC8', color: '#9B3D3D' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isAdmin && (
              <button
                onClick={openAdd}
                className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 py-10 font-body text-sm"
                style={{ borderColor: '#E0DCC8', color: '#9AA5AE' }}
              >
                <Plus size={20} />
                Add a new course
              </button>
            )}
          </div>
        )}
      </main>

      {/* PIN modal */}
      {showPin && (
        <div className="fixed inset-0 flex items-center justify-center p-5 z-50" style={{ backgroundColor: 'rgba(26,26,26,0.5)' }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base uppercase">Admin access</h2>
              <button onClick={() => { setShowPin(false); setPinValue(''); setPinError(''); }}>
                <X size={18} color="#6B6B6B" />
              </button>
            </div>
            <p className="font-body text-sm mb-3" style={{ color: '#6B6B6B' }}>Enter the admin PIN to add or edit courses.</p>
            <input
              type="password"
              value={pinValue}
              onChange={(e) => { setPinValue(e.target.value); setPinError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
              className="font-body w-full border-2 rounded-md px-3 py-2 text-sm outline-none"
              style={{ borderColor: '#E0DCC8' }}
              placeholder="PIN"
              autoFocus
            />
            {pinError && <p className="font-body text-xs mt-2" style={{ color: '#9B3D3D' }}>{pinError}</p>}
            <button onClick={tryUnlock} className="font-body w-full mt-4 py-2 rounded-md text-sm font-medium" style={{ backgroundColor: BLACK, color: YELLOW }}>
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* Add/edit form modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center p-5 z-50" style={{ backgroundColor: 'rgba(26,26,26,0.5)' }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base uppercase">{editingId ? 'Edit course' : 'Add course'}</h2>
              <button onClick={closeForm}><X size={18} color="#6B6B6B" /></button>
            </div>
            <div className="space-y-3 font-body text-sm">
              <Field label="Title *">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border-2 rounded-md px-3 py-2 outline-none" style={{ borderColor: '#E0DCC8' }} />
              </Field>
              <Field label="Provider *">
                <input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full border-2 rounded-md px-3 py-2 outline-none" style={{ borderColor: '#E0DCC8' }} placeholder="e.g. LinkedIn Learning, Coursera, SHRM" />
              </Field>
              <Field label="Category *">
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border-2 rounded-md px-3 py-2 outline-none" style={{ borderColor: '#E0DCC8' }} placeholder="e.g. Leadership, Compliance, Communication" list="category-options" />
                <datalist id="category-options">
                  {categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Format">
                  <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="w-full border-2 rounded-md px-3 py-2 outline-none" style={{ borderColor: '#E0DCC8' }}>
                    <option>Online</option>
                    <option>In-person</option>
                    <option>Hybrid</option>
                    <option>Self-paced</option>
                  </select>
                </Field>
                <Field label="Level">
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full border-2 rounded-md px-3 py-2 outline-none" style={{ borderColor: '#E0DCC8' }}>
                    <option>All levels</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </Field>
              </div>
              <Field label="Duration">
                <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full border-2 rounded-md px-3 py-2 outline-none" style={{ borderColor: '#E0DCC8' }} placeholder="e.g. 3 hours, 4 weeks" />
              </Field>
              <Field label="Link">
                <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full border-2 rounded-md px-3 py-2 outline-none" style={{ borderColor: '#E0DCC8' }} placeholder="https://..." />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border-2 rounded-md px-3 py-2 outline-none resize-none" style={{ borderColor: '#E0DCC8' }} />
              </Field>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={closeForm} className="flex-1 py-2 rounded-md border-2 text-sm font-medium" style={{ borderColor: '#E0DCC8', color: '#6B6B6B' }}>Cancel</button>
              <button
                onClick={saveForm}
                disabled={!form.title.trim() || !form.provider.trim() || !form.category.trim()}
                className="flex-1 py-2 rounded-md text-sm font-medium disabled:opacity-40"
                style={{ backgroundColor: BLACK, color: YELLOW }}
              >
                {editingId ? 'Save changes' : 'Add course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail / reviews modal */}
      {detailCourse && (
        <div className="fixed inset-0 flex items-center justify-center p-5 z-50" style={{ backgroundColor: 'rgba(26,26,26,0.5)' }}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b-2" style={{ borderColor: BLACK }}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase px-2 py-1" style={{ backgroundColor: BLACK, color: YELLOW }}>{detailCourse.category}</span>
                <button onClick={() => setDetailId(null)}><X size={18} color="#6B6B6B" /></button>
              </div>
              <h2 className="font-display text-lg uppercase mt-3">{detailCourse.title}</h2>
              <p className="font-body text-sm mt-1" style={{ color: '#6B6B6B' }}>{detailCourse.provider}</p>
              <p className="font-body text-sm mt-2" style={{ color: '#3A3A3A' }}>{detailCourse.description}</p>
              {detailCourse.link && (
                <a href={detailCourse.link} target="_blank" rel="noopener noreferrer" className="font-body text-sm flex items-center gap-1.5 font-medium mt-2">
                  Open course <ExternalLink size={13} />
                </a>
              )}
            </div>

            <div className="px-6 py-4">
              <h3 className="font-display text-sm uppercase mb-3">Reviews ({detailCourse.reviews.length})</h3>
              {detailCourse.reviews.length === 0 ? (
                <p className="font-body text-sm" style={{ color: '#9AA5AE' }}>No reviews yet. Be the first to share your experience.</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {detailCourse.reviews.map((r) => (
                    <div key={r.id} className="border-b pb-3" style={{ borderColor: '#EFEAE0' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Stars value={r.rating} />
                          <span className="font-body text-sm font-medium">{r.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs" style={{ color: '#C9C2B4' }}>{r.date}</span>
                          {isAdmin && (
                            <button onClick={() => deleteReview(detailCourse.id, r.id)}>
                              <Trash2 size={13} color="#9B3D3D" />
                            </button>
                          )}
                        </div>
                      </div>
                      {r.comment && <p className="font-body text-sm mt-1" style={{ color: '#3A3A3A' }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <h3 className="font-display text-sm uppercase mb-3">Write a review</h3>
                <div className="space-y-3 font-body text-sm">
                  <Field label="Your name & department *">
                    <input
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      className="w-full border-2 rounded-md px-3 py-2 outline-none"
                      style={{ borderColor: '#E0DCC8' }}
                      placeholder="e.g. Aom, HR"
                    />
                  </Field>
                  <Field label="Rating *">
                    <StarPicker value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
                  </Field>
                  <Field label="Comment">
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={2}
                      className="w-full border-2 rounded-md px-3 py-2 outline-none resize-none"
                      style={{ borderColor: '#E0DCC8' }}
                      placeholder="Was it useful? Who would you recommend it to?"
                    />
                  </Field>
                  {reviewError && <p className="text-xs" style={{ color: '#9B3D3D' }}>{reviewError}</p>}
                  <button onClick={submitReview} className="w-full py-2 rounded-md text-sm font-medium" style={{ backgroundColor: BLACK, color: YELLOW }}>
                    Submit review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-5xl mx-auto px-5 py-8 font-body text-xs" style={{ color: '#C9C2B4' }}>
        {courses.length} course{courses.length !== 1 ? 's' : ''} in the index
      </footer>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block mb-1 font-medium" style={{ color: '#3A3A3A' }}>{label}</label>
      {children}
    </div>
  );
}
