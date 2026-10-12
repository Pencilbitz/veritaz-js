import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { MdWork, MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import { supabase } from "../lib/supabase";

/**
 * Careers — the list of job adverts behind the public /careers page.
 *
 * Rows live in veritaz_careers (migration/sql/004_careers.sql). The public page
 * reads only the ones with status 'Open', which is the reason this screen shows
 * the status column prominently: from in here, 'Open' and 'Closed' look like a
 * tag, but on the live site they are the difference between advertised and not.
 *
 * Writes are possible here and nowhere else. The table's RLS grants select to
 * anon but restricts insert/update/delete to the authenticated role, and this
 * page is reached only through ProtectedRoute, so every request it makes carries
 * a real Supabase Auth JWT.
 */

// Closed roles are kept rather than deleted, so this list shows both and leans on
// the badge to tell them apart. Red is deliberate: a Closed advert is invisible
// to applicants, which is the kind of thing someone needs to notice at a glance
// when they are wondering why a role they added is not on the site.
const statusBadgeClass = (status) =>
  String(status).toLowerCase() === 'open'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-red-50 text-red-600';

const Careers = () => {
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const { data, error } = await supabase
        .from("veritaz_careers")
        .select("*")
        // Same ordering the public page uses, so what HR sees at the top of this
        // table is what an applicant meets at the top of /careers.
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCareers(data || []);
    } catch (error) {
      console.error("Error fetching careers:", error);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      // Worth spelling out: closing a role takes it off the public site already,
      // so a delete is only for adverts raised by mistake. Anything that was ever
      // live is better set to Closed, where it stays on the record.
      text: "This removes the role permanently. To take a role off the website but keep it on record, edit it and set the status to Closed instead.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#2563EB",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase
        .from("veritaz_careers")
        .delete()
        .eq("id", String(id));

      if (error) throw error;

      setCareers((prev) =>
        prev.filter((role) => String(role.id) !== String(id))
      );

      Swal.fire(
        "Deleted!",
        "Role has been removed.",
        "success"
      );
    } catch (error) {
      console.error(error);

      Swal.fire(
        "Error!",
        "Failed to delete role.",
        "error"
      );
    }
  };

  // Every column is nullable, so each one is checked before .toLowerCase() — a
  // role saved with only a title must not make the search box throw.
  const filtered = careers.filter((role) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const titleMatch = role.jobtitle ? role.jobtitle.toLowerCase().includes(searchLower) : false;
    const categoryMatch = role.category ? role.category.toLowerCase().includes(searchLower) : false;
    const locationMatch = role.location ? role.location.toLowerCase().includes(searchLower) : false;
    return titleMatch || categoryMatch || locationMatch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MdWork className="text-blue-600" /> Careers
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate('/admin/careers/add')} className="btn-primary text-sm">
            <MdAdd /> Add Role
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 border border-blue-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition-all">
          <MdSearch className="text-blue-400 text-lg" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title, category or location..."
            className="outline-none flex-1 text-sm bg-transparent"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-blue-50 border-b border-blue-100">
            <tr>
              {['Job Title', 'Category', 'Location', 'Work Mode', 'Employment Type', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((role) => (
              <tr key={role.id} className="hover:bg-blue-50 transition-colors border-b border-brand-border">
                <td className="px-4 py-4 max-w-xs">
                  <p className="font-semibold text-gray-900 line-clamp-2" title={role.jobtitle}>
                    {role.jobtitle || 'N/A'}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {role.category ? (
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {role.category}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{role.location || '—'}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{role.workmode || '—'}</td>
                <td className="px-4 py-4 text-sm text-gray-600">{role.employmenttype || '—'}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${statusBadgeClass(role.status)}`}>
                    {role.status || 'Open'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/careers/edit/${role.id}`)}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      title="Edit"
                    >
                      <MdEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500 text-sm">
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Careers;
