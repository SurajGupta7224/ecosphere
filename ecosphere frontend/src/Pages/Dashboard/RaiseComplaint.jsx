import React, { useEffect, useState } from "react";
import {
  FiUpload,
  FiX,
  FiFile,
  FiImage,
  FiSend,
  FiFileText,
} from "react-icons/fi";

import { customerFetch } from "../../api";

export default function RaiseComplaint({ customer }) {
  // =========================
  // FORM STATES
  // =========================

  const [complaintName, setComplaintName] = useState("");
  const [complaintEmail, setComplaintEmail] = useState("");

  const [complaintDate, setComplaintDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [subject, setSubject] = useState("Missed Pickup");
  const [otherSubject, setOtherSubject] = useState("");

  const [complaintDescription, setComplaintDescription] = useState("");

  // Uploaded files
  const [complaintFiles, setComplaintFiles] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState("");

  const capitalizeWords = (str) => {
    if (!str) return str;

    return str
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
      )
      .join(" ");
  };

  // =========================
  // AUTO-FILL CUSTOMER DETAILS
  // =========================

  useEffect(() => {
    if (customer) {
      setComplaintName(
          capitalizeWords(customer.customer_name) || ""	
      );

      setComplaintEmail(customer.email || "");
    }
  }, [customer]);

  // =========================
  // FILE UPLOAD
  // =========================

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) return;

    setComplaintFiles((previousFiles) => [
      ...previousFiles,
      ...selectedFiles,
    ]);

    // Reset input so the same file can be selected again
    event.target.value = "";
  };

  // =========================
  // REMOVE FILE
  // =========================

  const removeFile = (indexToRemove) => {
    setComplaintFiles((previousFiles) =>
      previousFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };

  // =========================
  // FILE TYPE HELPERS
  // =========================

  const isImageFile = (file) => {
    return file.type?.startsWith("image/");
  };

  const isPdfFile = (file) => {
    return file.type === "application/pdf";
  };

  const getFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFileExtension = (fileName) => {
    const parts = fileName.split(".");

    if (parts.length < 2) return "FILE";

    return parts.pop().toUpperCase();
  };

  // =========================
  // SUBMIT COMPLAINT
  // =========================

  const handleComplaintSubmit = async (event) => {
    event.preventDefault();

    const finalSubject =
      subject === "Other"
        ? otherSubject.trim()
        : subject;

    if (!complaintName.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!complaintEmail.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!finalSubject) {
      alert("Please enter a subject.");
      return;
    }

    if (!complaintDescription.trim()) {
      alert("Please describe your complaint.");
      return;
    }

    try {
      setSubmitting(true);

      
      
    	const formData = new FormData();
       
        formData.append("name", complaintName);
        formData.append("email", complaintEmail);
        formData.append("date", complaintDate);
        formData.append("subject", finalSubject);
        formData.append(
          "description",
          complaintDescription
        );
       
        complaintFiles.forEach((file) => {
          formData.append("files", file);
        });
       
        await customerFetch("/complaints", {
          method: "POST",
          body: formData,
        });
       

      const generatedComplaintId =
        "CMP-" + Math.floor(100000 + Math.random() * 900000);

      setSubmittedComplaintId(generatedComplaintId);
      setComplaintSubmitted(true);

      // Reset form
      setSubject("Missed Pickup");
      setOtherSubject("");
      setComplaintDescription("");
      setComplaintFiles([]);

      setComplaintDate(
        new Date().toISOString().split("T")[0]
      );
    } catch (error) {
      console.error(
        "Complaint submission error:",
        error
      );

      alert("Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // FILE PREVIEW
  // =========================

  const FilePreview = ({ file, index }) => {
    const imageFile = isImageFile(file);

    return (
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
        {imageFile ? (
          <div className="relative">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="h-32 w-full object-cover"
            />

            {/* Image overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8">
              <p className="truncate text-xs font-medium text-white">
                {file.name}
              </p>

              <p className="text-[10px] text-white/70">
                {getFileSize(file.size)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center px-3">
            {isPdfFile(file) ? (
              <FiFileText
                size={30}
                className="text-red-500"
              />
            ) : (
              <FiFile
                size={30}
                className="text-gray-400"
              />
            )}

            <p className="mt-2 w-full truncate text-center text-xs font-medium text-gray-700">
              {file.name}
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              {getFileExtension(file)} ·{" "}
              {getFileSize(file.size)}
            </p>
          </div>
        )}

        {/* Remove button */}
        <button
          type="button"
          onClick={() => removeFile(index)}
          title="Remove file"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
        >
          <FiX size={14} />
        </button>
      </div>
    );
  };

  // =========================
  // UI
  // =========================

  return (
	<div className="w-full">

		{complaintSubmitted ? (

		/* =====================================================
			SUCCESS SCREEN
		====================================================== */

		<div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
			<div className="flex flex-col items-center text-center">

			{/* SUCCESS ICON */}
			<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white">
				✓
				</div>
			</div>

			{/* TITLE */}
			<h2 className="mt-5 text-2xl font-bold text-gray-900">
				Complaint Raised
			</h2>

			{/* MESSAGE */}
			<p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
				Your complaint has been submitted successfully.
				Our team will review your complaint and get back to you.
			</p>

			{/* COMPLAINT ID */}
			<div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-6 py-4">
				<p className="text-xs font-medium text-gray-500">
				Complaint ID
				</p>

				<p className="mt-1 text-lg font-bold tracking-wide text-gray-900">
				{submittedComplaintId}
				</p>
			</div>

			{/* ACTION BUTTONS */}
			<div className="mt-6 flex flex-col gap-3 sm:flex-row">

				<button
				type="button"
				onClick={() => {
					console.log("View My Complaints");
				}}
				className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
				>
				View My Complaints
				</button>

				<button
				type="button"
				onClick={() => {
					setComplaintSubmitted(false);
					setSubmittedComplaintId("");
				}}
				className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
				>
				Raise Another Complaint
				</button>

			</div>
			</div>
		</div>

		) : (

		/* =====================================================
			COMPLAINT FORM
		====================================================== */

		<div className="w-full">

			{/* HEADER */}
			<div className="mb-6">
			<h2 className="text-2xl font-bold text-gray-900">
				Raise a Complaint
			</h2>

			<p className="mt-1 text-sm text-gray-500">
				Tell us what went wrong and we'll help resolve it.
			</p>
			</div>

			{/* FORM */}
			<form
			onSubmit={handleComplaintSubmit}
			className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
			>

			{/* =================================================
				TOP SECTION
				LEFT → 2×2 FIELDS
				RIGHT → FILE UPLOAD
			================================================== */}

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

				{/* LEFT SIDE */}
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

				{/* NAME */}
				<div>
					<label className="mb-2 block text-xs font-semibold text-gray-600">
					Name
					</label>

					<input
					type="text"
					value={complaintName}
					onChange={(e) =>
						setComplaintName(e.target.value)
					}
					placeholder="Enter your name"
					className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
					/>
				</div>

				{/* EMAIL */}
				<div>
					<label className="mb-2 block text-xs font-semibold text-gray-600">
					Email
					</label>

					<input
					type="email"
					value={complaintEmail}
					onChange={(e) =>
						setComplaintEmail(e.target.value)
					}
					placeholder="Enter your email"
					className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
					/>
				</div>

				{/* DATE */}
				<div>
					<label className="mb-2 block text-xs font-semibold text-gray-600">
					Date
					</label>

					<input
					type="date"
					value={complaintDate}
					onChange={(e) =>
						setComplaintDate(e.target.value)
					}
					className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
					/>
				</div>

				{/* SUBJECT */}
				<div>
					<label className="mb-2 block text-xs font-semibold text-gray-600">
					Subject
					</label>

					<select
					value={subject}
					onChange={(e) =>
						setSubject(e.target.value)
					}
					className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
					>
					<option value="Missed Pickup">
						Missed Pickup
					</option>

					<option value="Vehicle Delay">
						Vehicle Delay
					</option>

					<option value="Incorrect Waste Weight">
						Incorrect Waste Weight
					</option>

					<option value="Driver Behaviour">
						Driver Behaviour
					</option>

					<option value="Other">
						Other
					</option>
					</select>
				</div>

				{/* OTHER SUBJECT */}
				{subject === "Other" && (
					<div className="sm:col-span-2">
					<label className="mb-2 block text-xs font-semibold text-gray-600">
						Other Subject
					</label>

					<input
						type="text"
						value={otherSubject}
						onChange={(e) =>
						setOtherSubject(e.target.value)
						}
						placeholder="Enter your complaint subject"
						className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
					/>
					</div>
				)}

				</div>

				{/* =================================================
					RIGHT SIDE — FILE UPLOAD
				================================================== */}

				<div>

				<label className="mb-2 block text-xs font-semibold text-gray-600">
					Attach Files
				</label>

				<div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-4">

					{/* UPLOADED FILES */}

					{complaintFiles.length > 0 && (
					<div className="mb-4 grid grid-cols-2 gap-3">
						{complaintFiles.map((file, index) => (
						<FilePreview
							key={`${file.name}-${index}`}
							file={file}
							index={index}
						/>
						))}
					</div>
					)}

					{/* UPLOAD / UPLOAD ANOTHER */}

					<label
					htmlFor="complaint-file-upload"
					className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-4 py-6 transition hover:border-green-200 hover:bg-green-50"
					>

					<div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-100">

						{complaintFiles.length > 0 ? (
						<FiUpload
							size={19}
							className="text-green-700"
						/>
						) : (
						<FiImage
							size={19}
							className="text-green-700"
						/>
						)}

					</div>

					<p className="text-sm font-semibold text-gray-700">
						{complaintFiles.length > 0
						? "Upload another"
						: "Upload files"}
					</p>

					<p className="mt-1 text-center text-xs text-gray-400">
						Add images, PDF, documents, videos or any
						other file
					</p>

					<p className="mt-2 text-[11px] font-medium text-green-700">
						Click to browse files
					</p>

					<input
						id="complaint-file-upload"
						type="file"
						multiple
						accept="*/*"
						onChange={handleFileUpload}
						className="hidden"
					/>

					</label>

				</div>
				</div>

			</div>

			{/* =================================================
				DESCRIPTION — FULL WIDTH
			================================================== */}

			<div className="mt-6">

				<label className="mb-2 block text-xs font-semibold text-gray-600">
				Description
				</label>

				<textarea
				value={complaintDescription}
				onChange={(e) =>
					setComplaintDescription(e.target.value)
				}
				rows={5}
				placeholder="Describe the issue..."
				className="w-full resize-none rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
				/>

			</div>

			{/* =================================================
				SUBMIT — BOTTOM RIGHT
			================================================== */}

			<div className="mt-5 flex justify-end">

				<button
				type="submit"
				disabled={submitting}
				className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
				>

				<FiSend size={16} />

				{submitting
					? "Submitting..."
					: "Submit Complaint"}

				</button>

			</div>

			</form>

		</div>

		)}

	</div>
	);
}