import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  MdSearch, MdDelete, MdCheckCircle, MdPendingActions, MdPending,
  MdVisibility, MdClose, MdEmail, MdPhone, MdEvent, MdCategory,
} from 'react-icons/md';
import { supabase } from '../lib/supabase';

const INQUIRY_SELECT =
  'id, name, email, phone, message, formType:form_type, status, created_at';

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
      })
    : '—';

/** Status pill. Covers every value the table allows (see 001_schema.sql). */
function StatusBadge({ status }) {
  if (status === 'Resolved') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <MdCheckCircle className="mr-1" /> Resolved
      </span>
    );
  }
  if (status === 'Reviewed') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <MdCheckCircle className="mr-1" /> Reviewed
      </span>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        <MdPendingActions className="mr-1" /> In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <MdPending className="mr-1" /> Pending
    </span>
  );
}

const UserEnquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewing, setViewing] = useState(null);

  // Form types come from the data rather than a hardcoded list, so the filter
  // always matches what the public forms actually save ("Contact Us",
  // "Book Publishing", ...).
  const formTypes = [...new Set(inquiries.map((iq) => iq.formType).filter(Boolean))].sort();

  const filteredInquiries = inquiries.filter((iq) => {
    const q = search.toLowerCase();
    const nameMatch = iq.name ? iq.name.toLowerCase().includes(q) : false;
    const emailMatch = iq.email ? iq.email.toLowerCase().includes(q) : false;
    const matchSearch = !search || nameMatch || emailMatch;
    const matchType = !filterType || iq.formType === filterType;
    const matchStatus = !filterStatus || iq.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('veritaz_inquiries')
        .select(INQUIRY_SELECT)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Escape closes the details panel.
  useEffect(() => {
    if (!viewing) return undefined;
    const onKey = (e) => e.key === 'Escape' && setViewing(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewing]);

  const handleDeleteInquiry = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Inquiry?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Delete',
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.from('veritaz_inquiries').delete().eq('id', id);
      if (error) throw error;

      setInquiries((prev) => prev.filter((item) => item.id !== id));
      setViewing((current) => (current?.id === id ? null : current));

      Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1200, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to delete inquiry', 'error');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('veritaz_inquiries').update({ status: newStatus }).eq('id', id);
      if (error) throw error;

      setInquiries((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
      setViewing((current) => (current?.id === id ? { ...current, status: newStatus } : current));
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-brand-dark">User Enquiries</h1>
        <p className="text-sm text-brand-gray">Messages sent through the website's contact and publishing forms</p>
      </motion.div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-brand-bg border border-brand-border rounded-xl px-3 py-2 flex-1 min-w-[200px] focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <MdSearch className="text-brand-gray text-lg flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="bg-transparent text-sm outline-none flex-1 text-brand-dark placeholder-brand-gray/60"
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field w-auto">
            <option value="">All Form Types</option>
            {formTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-auto">
            <option value="">All Statuses</option>
            <option>Pending</option>
            <option>Reviewed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-brand-border">
              <tr>
                <th className="table-th text-left px-4 py-3 text-xs font-semibold text-gray-500 tracking-wider">Date</th>
                <th className="table-th text-left px-4 py-3 text-xs font-semibold text-gray-500 tracking-wider">User Info</th>
                <th className="table-th text-left px-4 py-3 text-xs font-semibold text-gray-500 tracking-wider">Form Type</th>
                <th className="table-th text-left px-4 py-3 text-xs font-semibold text-gray-500 tracking-wider">Message</th>
                <th className="table-th text-center px-4 py-3 text-xs font-semibold text-gray-500 tracking-wider">Status</th>
                <th className="table-th text-right px-4 py-3 text-xs font-semibold text-gray-500 tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-brand-gray font-medium">Loading enquiries…</td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-brand-gray font-medium">No inquiries found</td>
                </tr>
              ) : (
                filteredInquiries.map((iq) => (
                  <tr key={iq.id} className="table-tr hover:bg-gray-50 border-b border-gray-100 last:border-none">
                    <td className="table-td text-xs text-brand-gray whitespace-nowrap px-4 py-3">{formatDate(iq.created_at)}</td>
                    <td className="table-td px-4 py-3">
                      <p className="font-semibold text-brand-dark text-sm">{iq.name}</p>
                      <p className="text-xs text-brand-gray">{iq.email}</p>
                      <p className="text-xs text-brand-gray">{iq.phone}</p>
                    </td>
                    <td className="table-td px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {iq.formType || '—'}
                      </span>
                    </td>
                    <td className="table-td px-4 py-3">
                      <p className="text-xs text-brand-gray max-w-xs truncate" title={iq.message}>{iq.message}</p>
                    </td>
                    <td className="table-td text-center px-4 py-3">
                      <StatusBadge status={iq.status} />
                    </td>
                    <td className="table-td text-right px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewing(iq)}
                          className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <MdVisibility /> View
                        </button>
                        {iq.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(iq.id, 'Reviewed')}
                            className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <MdCheckCircle /> Mark Reviewed
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInquiry(iq.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <MdDelete className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details panel */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            key="enquiry-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setViewing(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="enquiry-details-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="enquiry-details-title" className="text-lg font-bold text-brand-dark">{viewing.name || 'Unnamed sender'}</h2>
                  <div className="mt-2"><StatusBadge status={viewing.status} /></div>
                </div>
                <button onClick={() => setViewing(null)} className="text-brand-gray hover:text-red-500" aria-label="Close">
                  <MdClose size={24} />
                </button>
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <MdEmail className="text-blue-600 flex-shrink-0" />
                  <dt className="sr-only">Email</dt>
                  <dd>
                    {viewing.email ? (
                      <a href={`mailto:${viewing.email}`} className="text-blue-600 hover:underline break-all">{viewing.email}</a>
                    ) : '—'}
                  </dd>
                </div>
                <div className="flex items-center gap-3">
                  <MdPhone className="text-blue-600 flex-shrink-0" />
                  <dt className="sr-only">Phone</dt>
                  <dd>
                    {viewing.phone ? (
                      <a href={`tel:${viewing.phone}`} className="text-blue-600 hover:underline">{viewing.phone}</a>
                    ) : '—'}
                  </dd>
                </div>
                <div className="flex items-center gap-3">
                  <MdCategory className="text-blue-600 flex-shrink-0" />
                  <dt className="sr-only">Form type</dt>
                  <dd className="text-brand-dark">{viewing.formType || '—'}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <MdEvent className="text-blue-600 flex-shrink-0" />
                  <dt className="sr-only">Received</dt>
                  <dd className="text-brand-dark">{formatDate(viewing.created_at)}</dd>
                </div>
              </dl>

              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Message</h3>
                <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-brand-dark">
                  {viewing.message || 'No message.'}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => handleDeleteInquiry(viewing.id)}
                  className="btn-outline text-red-500 border-red-200 hover:bg-red-50 flex items-center gap-1"
                >
                  <MdDelete /> Delete
                </button>
                {viewing.status === 'Pending' && (
                  <button onClick={() => handleUpdateStatus(viewing.id, 'Reviewed')} className="btn-primary flex items-center gap-1">
                    <MdCheckCircle /> Mark Reviewed
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserEnquiries;
