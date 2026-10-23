import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { problemApi } from "../../services/api";

const CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Cleaning",
  "Infrastructure",
  "Equipment",
  "Internet/Networking",
  "Other",
];

function SubmitProblem() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit. Please choose a smaller image.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessInfo(null);

    if (!title.trim() || !category || !location.trim() || !description.trim()) {
      setError("Please fill out all required fields marked with *.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("location", location.trim());
      formData.append("description", description.trim());
      if (imageFile) {
        formData.append("evidenceImage", imageFile);
      }

      const res = await problemApi.submit(formData);

      if (res.data.success) {
        setSuccessInfo({
          problemId: res.data.problem.problemId,
          title: res.data.problem.title,
        });
        // Clear form
        setTitle("");
        setCategory("");
        setLocation("");
        setDescription("");
        removeImage();
      }
    } catch (err) {
      console.error("Submission failed:", err);
      const message =
        err.response?.data?.message ||
        "Failed to submit problem report. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="Student">
      <div style={{ maxWidth: "800px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)" }}>
          Report a Problem
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px", marginBottom: "24px" }}>
          Submit details about maintenance, equipment, or facility issues on campus.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {successInfo && (
          <div className="alert alert-success" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <div>
              <strong>Problem Reported Successfully!</strong> Reference ID:{" "}
              <code>{successInfo.problemId}</code>
            </div>
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/user/problem/${successInfo.problemId}`)}
              >
                View Problem Report
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate("/user/my-problems")}
              >
                Go to My Problems
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Problem Title <span className="required">*</span>
              </label>
              <input
                id="title"
                type="text"
                className="form-control"
                placeholder="e.g. Broken Projector in Room 204"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">-- Select Problem Category --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Exact Location <span className="required">*</span>
              </label>
              <input
                id="location"
                type="text"
                className="form-control"
                placeholder="e.g. Main Library, 2nd Floor, Reading Room A"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Problem Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                className="form-control"
                placeholder="Provide specific details about the issue so staff can assign the right technician..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={2000}
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Evidence Image (Optional)</label>
              <p className="form-help" style={{ marginBottom: "10px" }}>
                Upload a photo showing the damaged equipment or issue (JPEG, PNG, max 5MB).
              </p>

              <input
                type="file"
                id="evidenceImageInput"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

              {!imagePreview ? (
                <label
                  htmlFor="evidenceImageInput"
                  className="btn btn-secondary"
                  style={{ display: "inline-block", cursor: "pointer" }}
                >
                  Choose Image File
                </label>
              ) : (
                <div style={{ marginTop: "12px" }}>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Evidence Preview"
                      style={{
                        display: "block",
                        maxWidth: "320px",
                        maxHeight: "220px",
                        objectFit: "contain",
                        backgroundColor: "#f1f5f9",
                      }}
                    />
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={removeImage}
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting Report..." : "Submit Problem Report"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/user/my-problems")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SubmitProblem;