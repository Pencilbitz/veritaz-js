import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { MdArrowBack, MdSave } from 'react-icons/md';

import { supabase } from "../lib/supabase";

/**
 * Add / edit a job advert in veritaz_careers.
 *
 * One component serves both, the way AddConference does: the route supplies an
 * :id for an edit and nothing for a create, and `isEdit` switches the fetch, the
 * save and the labels. Two near-identical files would be two files to keep in
 * step every time a column is added.
 *
 * Everything typed here lands on a public page the moment status is 'Open', so
 * the field hints below are written for whoever in HR is filling this in, not for
 * a developer.
 */

// The categories the public Careers page already names in its "What to include"
// list ("editorial, publishing operations, events, design, technology or
// support"). Kept as a closed list rather than a free-text box so the badges on
// the public page stay a small, consistent set instead of drifting into
// "Editorial", "editorial" and "Editorial Team".
const CATEGORIES = [
  'Editorial',
  'Publishing Operations',
  'Events',
  'Design',
  'Technology',
  'Support',
];

const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const AddCareer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    // A role is being advertised unless someone says otherwise, and the column
    // defaults to 'Open' in SQL too — so the form's default matches what the
    // database would have done anyway.
    defaultValues: {
      status: 'Open',
    },
  });

  // ═════════════════════════════════════════════════════════════════
  //  FETCH EXISTING DATA (EDIT MODE)
  // ═════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isEdit) return;

    const fetchCareer = async () => {
      try {
        const { data: role, error } = await supabase
          .from("veritaz_careers")
          .select("*")
          .eq("id", String(id))
          .maybeSingle();

        if (error) throw error;

        if (!role) {
          Swal.fire("Error", "Role not found", "error");
          return;
        }

        // Every column is nullable, so each one falls back to "". Feeding null
        // into a controlled input is what turns a text box into React's
        // "uncontrolled to controlled" warning and loses the first keystroke.
        reset({
          jobtitle: role.jobtitle || "",
          jobdescription: role.jobdescription || "",
          category: role.category || "",
          workmode: role.workmode || "",
          location: role.location || "",
          experiencerequired: role.experiencerequired || "",
          employmenttype: role.employmenttype || "",
          status: role.status || "Open",
        });
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to fetch role", "error");
      }
    };

    fetchCareer();
  }, [isEdit, id, reset]);

  // ═════════════════════════════════════════════════════════════════
  //  SUBMIT & ERRORS HANDLER
  // ═════════════════════════════════════════════════════════════════
  const onError = (formErrors) => {
    console.warn("⚠️ Form validation failed:", formErrors);
    Swal.fire({
      title: "Validation Error",
      text: "Please fill in all required fields highlighted in red.",
      icon: "warning"
    });
  };

  const onSubmit = async (data) => {
    try {
      // Blank optional fields are stored as null, not "". The public page decides
      // whether to render each line by truthiness, so an empty string would print
      // an icon with nothing beside it.
      const finalData = {
        jobtitle: data.jobtitle || "",
        jobdescription: data.jobdescription || null,
        category: data.category || null,
        workmode: data.workmode || null,
        location: data.location || null,
        experiencerequired: data.experiencerequired || null,
        employmenttype: data.employmenttype || null,
        status: data.status || "Open",
        // The schema is deliberately trigger-free (see 004_careers.sql), so the
        // app is what keeps updated_at honest.
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        const { error } = await supabase
          .from("veritaz_careers")
          .update(finalData)
          .eq("id", String(id));

        if (error) throw error;
      } else {
        // id is a text primary key with no default, matching the other veritaz_
        // tables, so the client mints one. Date.now() is the fallback for the
        // older browsers where crypto.randomUUID is missing.
        finalData.id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString();

        const { error } = await supabase
          .from("veritaz_careers")
          .insert(finalData);

        if (error) throw error;
      }

      Swal.fire({
        title: "Success!",
        text: isEdit ? "Role updated successfully." : "New role created.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/careers");
    } catch (error) {
      console.error("❌ Save Error:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to save role.",
        icon: "error",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/careers')}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <MdArrowBack className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold">
          {isEdit ? 'Edit Role' : 'Add New Role'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        {/* --- Basic Information --- */}
        <div className="card p-6">
          <h2 className="section-title mb-5">Role Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="label">Job Title *</label>
              <input
                {...register('jobtitle', { required: 'Job title is required' })}
                className="input-field"
                placeholder="e.g. Editorial Assistant"
              />
              {errors.jobtitle && (
                <span className="text-xs text-red-500 mt-1 block">{errors.jobtitle.message}</span>
              )}
            </div>

            <div>
              <label className="label">Category</label>
              <select {...register('category')} className="input-field">
                <option value="">Select Category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Employment Type</label>
              <select {...register('employmenttype')} className="input-field">
                <option value="">Select Employment Type</option>
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Work Mode</label>
              <select {...register('workmode')} className="input-field">
                <option value="">Select Work Mode</option>
                {WORK_MODES.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Location</label>
              <input
                {...register('location')}
                className="input-field"
                placeholder="e.g. Chennai, Tamil Nadu"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Experience Required</label>
              <input
                {...register('experiencerequired')}
                className="input-field"
                placeholder="e.g. 2-4 years, or Fresher"
              />
            </div>
          </div>
        </div>

        {/* --- Description --- */}
        <div className="card p-6">
          <h2 className="section-title mb-5">Job Description</h2>
          <textarea
            {...register('jobdescription')}
            className="input-field resize-none"
            rows={8}
            placeholder="What the role involves, and what you are looking for in an applicant..."
          />
          {/* The public page renders this as plain paragraphs split on line breaks,
              never as HTML — so blank lines work for structure, while pasted markup
              or a bullet character will show up literally. */}
          <p className="text-xs text-brand-gray mt-2">
            Plain text only. Leave a blank line between paragraphs — the website keeps those
            breaks. HTML tags are not rendered.
          </p>
        </div>

        {/* --- Visibility --- */}
        <div className="card p-6">
          <h2 className="section-title mb-5">Visibility</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input-field">
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
              {/* This is the only field on the form that changes what the public
                  sees, so it says so rather than leaving someone to discover it. */}
              <p className="text-xs text-brand-gray mt-2">
                Open roles appear on the public Careers page. Closed roles stay here on record and
                are hidden from the website.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-primary px-8 py-2.5 text-lg flex items-center gap-2">
            <MdSave className="text-xl" /> {isEdit ? 'Save Changes' : 'Publish Role'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCareer;
