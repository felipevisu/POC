import React, { useState, type ChangeEvent, type JSX } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  CloseButton,
} from "react-bootstrap";
import { Rating } from "react-simple-star-rating";
import "bootstrap/dist/css/bootstrap.min.css";

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
  workPreferences: string[];
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
    fullName: "",
    email: "",
    phone: "",
    linkedIn: "",
    portfolio: "",
    position: "",
    department: "",
    experienceLevel: "",
    skills: [],
    employmentType: "",
    relocation: "",
    workPreferences: [],
    benefits: [],
    immediateStart: false,
    referral: false,
    salaryExpectation: 50000,
    yearsExperience: 0,
    selfRating: 3,
    preferredLocations: [],
    availableFrom: "",
    coverLetter: "",
    achievements: "",
    resumeFileName: "",
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [locationInput, setLocationInput] = useState<string>("");
  const [showLocationDropdown, setShowLocationDropdown] =
    useState<boolean>(false);

  const handleChange =
    (field: keyof FormData) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ): void => {
      setFormData({ ...formData, [field]: event.target.value });
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

  const handleSkillToggle = (skill: string): void => {
    const currentSkills = formData.skills;
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill];
    setFormData({ ...formData, skills: newSkills });
  };

  const handleLocationToggle = (location: string): void => {
    const currentLocations = formData.preferredLocations;
    const newLocations = currentLocations.includes(location)
      ? currentLocations.filter((l) => l !== location)
      : [...currentLocations, location];
    setFormData({ ...formData, preferredLocations: newLocations });
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

  const workLocationOptions: string[] = ["remote", "hybrid", "onsite"];
  const workLocationLabels: { [key: string]: string } = {
    remote: "Remote Work",
    hybrid: "Hybrid Work",
    onsite: "On-Site Work",
  };

  return (
    <div className="bootstrap-form-wrapper">
      <Container className="py-5">
        <Card className="shadow-lg">
          <Card.Body className="p-4">
            <Card.Title as="h1" className="mb-4">
              Senior Software Engineer Application
            </Card.Title>

            {submitted && (
              <Alert variant="success">
                <strong>Success!</strong> Application submitted successfully!
                We'll review your information and get back to you soon.
              </Alert>
            )}

            <Form onSubmit={handleSubmit} noValidate>
              <h2 className="h5 mb-3 mt-4">Personal Information</h2>
              <hr className="mb-4" />

              <Form.Group className="mb-3" controlId="fullname">
                <Form.Label>
                  Full Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="fullname"
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="John Doe"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="john@example.com"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="phone">
                <Form.Label>
                  Phone Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="linkedin">
                <Form.Label>LinkedIn Profile</Form.Label>
                <Form.Control
                  type="text"
                  name="linkedin"
                  value={formData.linkedIn}
                  onChange={handleChange("linkedIn")}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="portfolio">
                <Form.Label>Portfolio Website</Form.Label>
                <Form.Control
                  type="text"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange("portfolio")}
                  placeholder="https://yourportfolio.com"
                />
              </Form.Group>

              <h2 className="h5 mb-3 mt-4">Position Details</h2>
              <hr className="mb-4" />

              <Form.Group className="mb-3" controlId="position">
                <Form.Label>
                  Position Applying For <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="position"
                  value={formData.position}
                  onChange={handleChange("position")}
                  required
                >
                  <option value="">Select position</option>
                  <option value="frontend">Frontend Engineer</option>
                  <option value="backend">Backend Engineer</option>
                  <option value="fullstack">Full Stack Engineer</option>
                  <option value="devops">DevOps Engineer</option>
                  <option value="mobile">Mobile Engineer</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="department">
                <Form.Label>
                  Department <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange("department")}
                  required
                >
                  <option value="">Select department</option>
                  <option value="engineering">Engineering</option>
                  <option value="product">Product</option>
                  <option value="design">Design</option>
                  <option value="data">Data Science</option>
                  <option value="security">Security</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="experienceLevel">
                <Form.Label>
                  Experience Level <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange("experienceLevel")}
                  required
                >
                  <option value="">Select experience level</option>
                  <option value="junior">Junior (0-2 years)</option>
                  <option value="mid">Mid-Level (3-5 years)</option>
                  <option value="senior">Senior (6-10 years)</option>
                  <option value="lead">Lead (10+ years)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="skills">
                <Form.Label>Technical Skills</Form.Label>
                <Form.Select
                  name="skills"
                  value=""
                  onChange={(e) => {
                    if (
                      e.target.value &&
                      !formData.skills.includes(e.target.value)
                    ) {
                      handleSkillToggle(e.target.value);
                    }
                  }}
                >
                  <option value="">Add skills</option>
                  {skillsList
                    .filter((skill) => !formData.skills.includes(skill))
                    .map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Select all that apply
                </Form.Text>
                <div className="mt-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} bg="primary" className="me-2 mb-2">
                      {skill}
                      <CloseButton
                        variant="white"
                        className="ms-2"
                        aria-label="Remove"
                        onClick={() => handleSkillToggle(skill)}
                        style={{ fontSize: "0.6rem", padding: "0.15rem" }}
                      />
                    </Badge>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="preferredLocations">
                <Form.Label>Preferred Work Locations</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    name="preferredLocations"
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowLocationDropdown(false), 200);
                    }}
                    placeholder="Select cities"
                  />
                  {showLocationDropdown && locationInput && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-sm"
                      style={{
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {cities
                        .filter(
                          (city) =>
                            city
                              .toLowerCase()
                              .includes(locationInput.toLowerCase()) &&
                            !formData.preferredLocations.includes(city)
                        )
                        .map((city) => (
                          <div
                            key={city}
                            className="px-3 py-2 cursor-pointer"
                            role="option"
                            style={{ cursor: "pointer" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f8f9fa")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "white")
                            }
                            onClick={() => {
                              if (!formData.preferredLocations.includes(city)) {
                                setFormData({
                                  ...formData,
                                  preferredLocations: [
                                    ...formData.preferredLocations,
                                    city,
                                  ],
                                });
                                setLocationInput("");
                                setShowLocationDropdown(false);
                              }
                            }}
                          >
                            {city}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  {formData.preferredLocations.map((location) => (
                    <Badge key={location} bg="success" className="me-2 mb-2">
                      {location}
                      <CloseButton
                        variant="white"
                        className="ms-2"
                        aria-label="Remove"
                        onClick={() => handleLocationToggle(location)}
                        style={{ fontSize: "0.6rem", padding: "0.15rem" }}
                      />
                    </Badge>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="yearsExperience">
                <Form.Label>
                  Years of Experience: {formData.yearsExperience}
                </Form.Label>
                <Form.Range
                  name="yearsExperience"
                  min={0}
                  max={20}
                  step={1}
                  value={formData.yearsExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsExperience: parseInt(e.target.value),
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rate Your Overall Technical Proficiency</Form.Label>
                <div>
                  <Rating
                    onClick={(rate) =>
                      setFormData({ ...formData, selfRating: rate })
                    }
                    initialValue={formData.selfRating || 0}
                    size={30}
                    allowFraction={false}
                    transition
                    fillColor="#ffc107"
                    emptyColor="#e0e0e0"
                  />
                  <input
                    type="hidden"
                    name="rate"
                    value={formData.selfRating || ""}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Employment Type Preference</Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    name="employmentType"
                    id="fulltime"
                    value="fulltime"
                    label="Full-Time"
                    checked={formData.employmentType === "fulltime"}
                    onChange={handleChange("employmentType")}
                  />
                  <Form.Check
                    type="radio"
                    name="employmentType"
                    id="parttime"
                    value="parttime"
                    label="Part-Time"
                    checked={formData.employmentType === "parttime"}
                    onChange={handleChange("employmentType")}
                  />
                  <Form.Check
                    type="radio"
                    name="employmentType"
                    id="contract"
                    value="contract"
                    label="Contract"
                    checked={formData.employmentType === "contract"}
                    onChange={handleChange("employmentType")}
                  />
                  <Form.Check
                    type="radio"
                    name="employmentType"
                    id="freelance"
                    value="freelance"
                    label="Freelance"
                    checked={formData.employmentType === "freelance"}
                    onChange={handleChange("employmentType")}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Work Location Preferences</Form.Label>
                {workLocationOptions.map((value) => (
                  <Form.Check
                    key={value}
                    type="checkbox"
                    name="workPreferences"
                    id={value}
                    value={value}
                    label={workLocationLabels[value]}
                    checked={formData.workPreferences.includes(value)}
                    onChange={handleCheckboxArray("workPreferences")}
                  />
                ))}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  Important Benefits (Select all that apply)
                </Form.Label>
                {benefitOptions.map((benefit) => (
                  <Form.Check
                    key={benefit}
                    type="checkbox"
                    name="benefits"
                    id={benefit}
                    value={benefit}
                    label={benefit}
                    checked={formData.benefits.includes(benefit)}
                    onChange={handleCheckboxArray("benefits")}
                  />
                ))}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Open to Relocation?</Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    name="relocation"
                    id="yes"
                    value="yes"
                    label="Yes"
                    checked={formData.relocation === "yes"}
                    onChange={handleChange("relocation")}
                  />
                  <Form.Check
                    type="radio"
                    name="relocation"
                    id="no"
                    value="no"
                    label="No"
                    checked={formData.relocation === "no"}
                    onChange={handleChange("relocation")}
                  />
                  <Form.Check
                    type="radio"
                    name="relocation"
                    id="maybe"
                    value="maybe"
                    label="Maybe, depends on location"
                    checked={formData.relocation === "maybe"}
                    onChange={handleChange("relocation")}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="immediateStart"
                  name="immediateStart"
                  label="Available for Immediate Start"
                  checked={formData.immediateStart}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      immediateStart: e.target.checked,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="referral"
                  name="referral"
                  label="Were you referred by an employee?"
                  checked={formData.referral}
                  onChange={(e) =>
                    setFormData({ ...formData, referral: e.target.checked })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="availableFrom">
                <Form.Label>Available Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleChange("availableFrom")}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="salaryExpectation">
                <Form.Label>
                  Salary Expectation: $
                  {formData.salaryExpectation.toLocaleString()}
                </Form.Label>
                <Form.Range
                  name="salaryExpectation"
                  min={0}
                  max={250000}
                  step={5000}
                  value={formData.salaryExpectation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      salaryExpectation: parseInt(e.target.value),
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="coverLetter">
                <Form.Label>Cover Letter</Form.Label>
                <Form.Control
                  as="textarea"
                  name="coverLetter"
                  rows={6}
                  value={formData.coverLetter}
                  onChange={handleChange("coverLetter")}
                  placeholder="Tell us why you're interested in this position..."
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="achievements">
                <Form.Label>Key Achievements</Form.Label>
                <Form.Control
                  as="textarea"
                  name="achievements"
                  rows={4}
                  value={formData.achievements}
                  onChange={handleChange("achievements")}
                  placeholder="List your most significant professional achievements..."
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-100 mt-3"
              >
                Submit Application
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
