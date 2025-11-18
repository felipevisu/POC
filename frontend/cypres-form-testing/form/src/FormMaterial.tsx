import React, { useState, type ChangeEvent, type JSX } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Radio,
  RadioGroup,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Slider,
  Switch,
  Chip,
  OutlinedInput,
  Rating,
  Autocomplete,
  Typography,
  Container,
  Paper,
  Divider,
  Alert,
  type SelectChangeEvent,
} from "@mui/material";

interface WorkPreferences {
  remote: boolean;
  hybrid: boolean;
  onsite: boolean;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  linkedIn: string;
  portfolio: string;
  position: string;
  department: string;
  experienceLevel: string;
  skills: string[];
  employmentType: string;
  relocation: string;
  workPreferences: WorkPreferences;
  benefits: string[];
  immediateStart: boolean;
  referral: boolean;
  salaryExpectation: number;
  yearsExperience: number;
  selfRating: number | null;
  preferredLocations: string[];
  availableFrom: string;
  coverLetter: string;
  achievements: string;
  resumeFileName: string;
}

export default function JobApplicationForm(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    // Text inputs
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    portfolio: "",

    // Select
    position: "",
    department: "",
    experienceLevel: "",

    // Multi-select
    skills: [],

    // Radio
    employmentType: "",
    relocation: "",

    // Checkboxes
    workPreferences: {
      remote: false,
      hybrid: false,
      onsite: false,
    },
    benefits: [],

    // Switch
    immediateStart: false,
    referral: false,

    // Slider
    salaryExpectation: 50000,
    yearsExperience: 0,

    // Rating
    selfRating: 3,

    // Autocomplete
    preferredLocations: [],

    // Date
    availableFrom: "",

    // Textarea
    coverLetter: "",
    achievements: "",

    // File (simulated)
    resumeFileName: "",
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange =
    (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      setFormData({ ...formData, [field]: event.target.value });
    };

  const handleSelectChange =
    (field: keyof FormData) =>
    (event: SelectChangeEvent<string>): void => {
      setFormData({ ...formData, [field]: event.target.value as string });
    };

  const handleCheckboxGroup = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked } = event.target;
    setFormData({
      ...formData,
      [name]: {
        ...(formData[name as keyof FormData] as WorkPreferences),
        [value]: checked,
      },
    });
  };

  const handleCheckboxArray =
    (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const value = event.target.value;
      const currentArray = formData[field] as string[];
      const newArray = event.target.checked
        ? [...currentArray, value]
        : currentArray.filter((item: string) => item !== value);
      setFormData({ ...formData, [field]: newArray });
    };

  const handleSwitch =
    (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      setFormData({ ...formData, [field]: event.target.checked });
    };

  const handleSlider =
    (field: keyof FormData) =>
    (event: Event, value: number | number[]): void => {
      setFormData({ ...formData, [field]: value as number });
    };

  const handleMultiSelect =
    (field: keyof FormData) =>
    (event: SelectChangeEvent<string[]>): void => {
      const value = event.target.value;
      setFormData({
        ...formData,
        [field]: typeof value === "string" ? value.split(",") : value,
      });
    };

  const handleAutocomplete =
    (field: keyof FormData) =>
    (event: React.SyntheticEvent, value: string[]): void => {
      setFormData({ ...formData, [field]: value });
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSubmitted(true);
    console.log("Form Data:", formData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const skillsList: string[] = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "SQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
  ];

  const cities: string[] = [
    "New York",
    "San Francisco",
    "Los Angeles",
    "Chicago",
    "Boston",
    "Seattle",
    "Austin",
    "Denver",
    "Miami",
    "Portland",
  ];

  const benefitOptions: string[] = [
    "Health Insurance",
    "Dental Insurance",
    "Vision Insurance",
    "401k Matching",
    "Stock Options",
    "Professional Development",
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Senior Software Engineer Application
        </Typography>

        {submitted && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Application submitted successfully! We'll review your information
            and get back to you soon.
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <TextField
            fullWidth
            label="Full Name"
            name="fullname"
            value={formData.fullName}
            onChange={handleChange("fullName")}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange("email")}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange("phone")}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="LinkedIn Profile"
            name="linkedin"
            value={formData.linkedIn}
            onChange={handleChange("linkedIn")}
            placeholder="https://linkedin.com/in/yourprofile"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Portfolio Website"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleChange("portfolio")}
            placeholder="https://yourportfolio.com"
            sx={{ mb: 2 }}
          />

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Position Details
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Position Applying For</InputLabel>
            <Select
              value={formData.position}
              label="Position Applying For"
              name="position"
              onChange={handleSelectChange("position")}
            >
              <MenuItem value="frontend">Frontend Engineer</MenuItem>
              <MenuItem value="backend">Backend Engineer</MenuItem>
              <MenuItem value="fullstack">Full Stack Engineer</MenuItem>
              <MenuItem value="devops">DevOps Engineer</MenuItem>
              <MenuItem value="mobile">Mobile Engineer</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.department}
              label="Department"
              name="department"
              onChange={handleSelectChange("department")}
            >
              <MenuItem value="engineering">Engineering</MenuItem>
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="data">Data Science</MenuItem>
              <MenuItem value="security">Security</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Experience Level</InputLabel>
            <Select
              value={formData.experienceLevel}
              label="Experience Level"
              name="experienceLevel"
              onChange={handleSelectChange("experienceLevel")}
            >
              <MenuItem value="junior">Junior (0-2 years)</MenuItem>
              <MenuItem value="mid">Mid-Level (3-5 years)</MenuItem>
              <MenuItem value="senior">Senior (6-10 years)</MenuItem>
              <MenuItem value="lead">Lead (10+ years)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Technical Skills</InputLabel>
            <Select
              multiple
              name="skills"
              value={formData.skills}
              onChange={handleMultiSelect("skills")}
              input={<OutlinedInput label="Technical Skills" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {skillsList.map((skill) => (
                <MenuItem key={skill} value={skill}>
                  {skill}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select all that apply</FormHelperText>
          </FormControl>

          <Autocomplete
            multiple
            options={cities}
            value={formData.preferredLocations}
            onChange={handleAutocomplete("preferredLocations")}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Preferred Work Locations"
                name="preferredLocations"
                placeholder="Select cities"
              />
            )}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Years of Experience: {formData.yearsExperience}
            </Typography>
            <Slider
              name="yearsExperience"
              value={formData.yearsExperience}
              onChange={handleSlider("yearsExperience")}
              min={0}
              max={20}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Rate Your Overall Technical Proficiency
            </Typography>
            <Rating
              name="rate"
              value={formData.selfRating}
              onChange={(event, newValue) => {
                setFormData({ ...formData, selfRating: newValue });
              }}
              size="large"
            />
          </Box>

          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend">Employment Type Preference</FormLabel>
            <RadioGroup
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange("employmentType")}
            >
              <FormControlLabel
                value="fulltime"
                control={<Radio />}
                label="Full-Time"
              />
              <FormControlLabel
                value="parttime"
                control={<Radio />}
                label="Part-Time"
              />
              <FormControlLabel
                value="contract"
                control={<Radio />}
                label="Contract"
              />
              <FormControlLabel
                value="freelance"
                control={<Radio />}
                label="Freelance"
              />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend">Work Location Preferences</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    value="remote"
                    checked={formData.workPreferences.remote}
                    onChange={handleCheckboxGroup}
                  />
                }
                label="Remote Work"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="workPreferences"
                    value="hybrid"
                    checked={formData.workPreferences.hybrid}
                    onChange={handleCheckboxGroup}
                  />
                }
                label="Hybrid Work"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="workPreferences"
                    value="onsite"
                    checked={formData.workPreferences.onsite}
                    onChange={handleCheckboxGroup}
                  />
                }
                label="On-Site Work"
              />
            </FormGroup>
          </FormControl>

          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend">
              Important Benefits (Select all that apply)
            </FormLabel>
            <FormGroup>
              {benefitOptions.map((benefit) => (
                <FormControlLabel
                  key={benefit}
                  name="benefits"
                  control={
                    <Checkbox
                      value={benefit}
                      checked={formData.benefits.includes(benefit)}
                      onChange={handleCheckboxArray("benefits")}
                    />
                  }
                  label={benefit}
                />
              ))}
            </FormGroup>
          </FormControl>

          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend">Open to Relocation?</FormLabel>
            <RadioGroup
              name="relocation"
              value={formData.relocation}
              onChange={handleChange("relocation")}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
              <FormControlLabel
                value="maybe"
                control={<Radio />}
                label="Maybe, depends on location"
              />
            </RadioGroup>
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              name="immediateStart"
              control={
                <Switch
                  checked={formData.immediateStart}
                  onChange={handleSwitch("immediateStart")}
                />
              }
              label="Available for Immediate Start"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              name="referral"
              control={
                <Switch
                  checked={formData.referral}
                  onChange={handleSwitch("referral")}
                />
              }
              label="Were you referred by an employee?"
            />
          </Box>

          <TextField
            fullWidth
            label="Available Start Date"
            name="availableFrom"
            type="date"
            value={formData.availableFrom}
            onChange={handleChange("availableFrom")}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Salary Expectation: ${formData.salaryExpectation.toLocaleString()}
            </Typography>
            <Slider
              name="salaryExpectation"
              value={formData.salaryExpectation}
              onChange={handleSlider("salaryExpectation")}
              min={30000}
              max={250000}
              step={5000}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value.toLocaleString()}`}
            />
          </Box>

          <TextField
            fullWidth
            label="Cover Letter"
            multiline
            rows={6}
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange("coverLetter")}
            placeholder="Tell us why you're interested in this position..."
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Key Achievements"
            multiline
            rows={4}
            value={formData.achievements}
            name="achievements"
            onChange={handleChange("achievements")}
            placeholder="List your most significant professional achievements..."
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
          >
            Submit Application
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
