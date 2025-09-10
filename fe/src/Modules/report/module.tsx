import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BaseLayout from '@components/layouts/base/index';

const formatTime = (timeString: string) => {
  const [time, modifier] = timeString.split(" ");
  let [hours, minutes] = time.split(":");

  if (modifier === "PM" && hours !== "12") {
    hours = String(parseInt(hours, 10) + 12);
  } else if (modifier === "AM" && hours === "12") {
    hours = "00";
  }

  return `${hours}:${minutes}:00`;
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ReportModule: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('Fetching location...');
  const [photo, setPhoto] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionTime, setSubmissionTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    setDate(getTodayDate());
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setSubmissionTime(formattedTime);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
              params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
              },
            });
            const address = response.data.display_name;
            setLocation(address || 'Location not available');
          } catch {
            setLocation('Failed to fetch location');
          }
        },
        () => setLocation('Failed to fetch location')
      );
    } else {
      setLocation('Geolocation not supported');
    }
  }, []);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPEG, JPG, PNG)");
        return;
      }
      setPhoto(file);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);

    // Enforce minimum 20 characters
    if (value.length < 20) {
      setDescriptionError('Description must be at least 20 characters long.');
    } else {
      setDescriptionError(''); // Clear the error if valid
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    // Validate description length before submitting
    if (description.length < 20) {
      alert('Description must be at least 20 characters long.');
      setIsSubmitting(false);
      return;
    }

    if (!customerName || !photo) {
      alert('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('customerName', customerName);
    formData.append('date', date);
    formData.append('location', location);
    formData.append('submissionTime', formatTime(submissionTime));
    formData.append('endTime', formatTime(endTime));
    formData.append('photo', photo);
    formData.append('description', description);

    try {
      // Retrieve credentials from localStorage
      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');

      if (!username || !password) {
        alert('Missing credentials. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      await axios.post('http://localhost:5000/api/reports/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          username,
          password,
        },
      });

      alert('Form submitted successfully!');
      setCustomerName('');
      setDate(getTodayDate());
      setLocation('Fetching location...');
      setPhoto(null);
      setSubmissionTime('');
      setEndTime('');
      setDescription('');
    } catch {
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseLayout>
      <form
        onSubmit={handleSubmit}
        className="p-4 mx-auto max-w-lg my-6"
      >
        <h2 className="text-center text-xl font-bold mb-6 text-white mt-12">Report Submission</h2>

        <div className="space-y-4">
          {/* Customer Name */}
          <div className="bg-white rounded-lg p-4 shadow">
            <label className="block text-sm font-bold mb-1">Customer Name:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Date */}
          <div className="bg-white rounded-lg p-4 shadow">
            <label className="block text-sm font-bold mb-1">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Time Fields */}
          <div className="grid grid-cols-2 gap-4 bg-white rounded-lg p-4 shadow">
            <div>
              <label className="block text-sm font-bold mb-1">Submission Time:</label>
              <input
                type="text"
                value={submissionTime}
                readOnly
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">End Time:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg p-4 shadow">
            <label className="block text-sm font-bold mb-1">Location:</label>
            <input
              type="text"
              value={location}
              readOnly
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-4 shadow">
            <label className="block text-sm font-bold mb-1">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2 border rounded resize-none"
            />
          {descriptionError && (
              <p className="text-red-500 text-sm mt-1">{descriptionError}</p>
            )}
          </div>
          
          {/* Photo Upload */}
          <div className="bg-white rounded-lg p-4 shadow">
            <label className="block text-sm font-bold mb-1">Photo:</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-3 rounded font-bold text-white ${
              isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </BaseLayout>
  );
};

export default ReportModule;
