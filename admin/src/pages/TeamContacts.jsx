import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { MdAdd, MdEdit, MdDelete, MdEmail, MdPhone, MdClose, MdPerson } from 'react-icons/md';
import UploadBox from '../components/UploadBox';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../lib/storage';

const EMPTY_CONTACT = { id: null, name: '', designation: '', phone: '', email: '', photo: '' };

const TeamContacts = () => {
  const [teamContacts, setTeamContacts] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('veritaz_team_contacts')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setTeamContacts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleAddContactClick = () => {
    setContactForm(EMPTY_CONTACT);
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowContactForm(true);
  };

  const handleEditContactClick = (contact) => {
    setContactForm({ ...contact });
    setPhotoFile(null);
    setPhotoPreview(contact.photo || null);
    setShowContactForm(true);
  };

  const handleDeleteContact = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Contact?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Delete',
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await supabase.from('veritaz_team_contacts').delete().eq('id', String(id));
      if (error) throw error;

      await fetchTeam();
      Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1200, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete contact', 'error');
    }
  };

  const handleSaveContact = async () => {
    if (!contactForm.name) {
      Swal.fire('Error', 'Name is required', 'error');
      return;
    }

    if (saving) return;
    setSaving(true);

    try {
      let photo = contactForm.photo;
      if (photoFile) {
        photo = await uploadImage(photoFile);
      }

      if (contactForm.id) {
        const { error } = await supabase
          .from('veritaz_team_contacts')
          .update({
            name: contactForm.name,
            designation: contactForm.designation,
            phone: contactForm.phone,
            email: contactForm.email,
            photo,
          })
          .eq('id', String(contactForm.id));

        if (error) throw error;
      } else {
        const { data: existing, error: readErr } = await supabase.from('veritaz_team_contacts').select('id');
        if (readErr) throw readErr;

        const maxId = (existing || []).reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);

        const { error } = await supabase.from('veritaz_team_contacts').insert({
          id: String(maxId + 1),
          created_at: new Date().toISOString(),
          name: contactForm.name,
          designation: contactForm.designation,
          phone: contactForm.phone,
          email: contactForm.email,
          photo,
        });

        if (error) throw error;
      }

      Swal.fire({
        title: contactForm.id ? 'Updated!' : 'Added!',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false,
      });

      await fetchTeam();
      setShowContactForm(false);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save contact', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-brand-dark">Team Contacts</h1>
          <p className="text-sm text-brand-gray">Manage team contact profiles</p>
        </div>
        {!showContactForm && (
          <button onClick={handleAddContactClick} className="btn-primary text-sm flex items-center gap-1">
            <MdAdd /> Add Contact
          </button>
        )}
      </motion.div>

      {showContactForm ? (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-brand-dark">{contactForm.id ? 'Edit Contact' : 'Add New Contact'}</h2>
            <button onClick={() => setShowContactForm(false)} className="text-brand-gray hover:text-red-500" aria-label="Close">
              <MdClose size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <UploadBox
                label="Contact Photo"
                value={photoPreview}
                onChange={(file, preview) => {
                  setPhotoFile(file);
                  setPhotoPreview(preview);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">Name <span className="text-red-500">*</span></label>
              <input
                type="text" className="input-field w-full" placeholder="e.g. Shahin"
                value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">Designation</label>
              <input
                type="text" className="input-field w-full" placeholder="e.g. BD MANAGER - PATENT"
                value={contactForm.designation} onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">Phone Number</label>
              <input
                type="text" className="input-field w-full" placeholder="e.g. +91 9003025706"
                value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email" className="input-field w-full" placeholder="e.g. patent.bbinternational@gmail.com"
                value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowContactForm(false)} className="btn-outline">Cancel</button>
            <button onClick={handleSaveContact} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamContacts.map((contact) => (
            <div key={contact.id} className="card overflow-hidden group">
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                {contact.photo ? (
                  <img src={contact.photo} alt={contact.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                    <MdPerson size={64} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button onClick={() => handleEditContactClick(contact)} aria-label={`Edit ${contact.name}`} className="w-8 h-8 rounded-lg bg-white/90 text-blue-600 shadow-sm flex items-center justify-center hover:bg-blue-50 transition-colors">
                    <MdEdit size={16} />
                  </button>
                  <button onClick={() => handleDeleteContact(contact.id)} aria-label={`Delete ${contact.name}`} className="w-8 h-8 rounded-lg bg-white/90 text-red-500 shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors">
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-brand-dark text-lg">{contact.name}</h3>
                <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase mt-1 mb-3">{contact.designation}</p>

                <div className="space-y-2 text-sm text-brand-gray bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-center gap-2">
                    <MdPhone className="text-teal-600 flex-shrink-0" />
                    <span className="truncate">{contact.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <MdEmail className="text-teal-600 flex-shrink-0" />
                    <span className="truncate" title={contact.email}>{contact.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {teamContacts.length === 0 && (
            <div className="col-span-full py-16 text-center text-brand-gray font-medium card">
              No team contacts found. Click "Add Contact" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamContacts;
