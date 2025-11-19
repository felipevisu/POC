import React, { useState, type ChangeEvent, type JSX } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  Stack,
  Wrap,
  Input,
  Textarea,
  Text,
  Flex,
  createListCollection,
  CheckboxGroup,
  For,
  Fieldset,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react/field";
import { Checkbox } from "@chakra-ui/react/checkbox";
import { RadioGroup } from "@chakra-ui/react/radio-group";
import { Slider } from "@chakra-ui/react/slider";
import { RatingGroup } from "@chakra-ui/react";
import { Switch } from "@chakra-ui/react/switch";
import { Tag } from "@chakra-ui/react/tag";
import { Separator } from "@chakra-ui/react/separator";
import { Alert } from "@chakra-ui/react/alert";
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from "@chakra-ui/react/select";

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
  workPreferences: string[]; // Changed to array
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

    // Checkboxes - now using arrays
    workPreferences: [],
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

  // Collections for Select components
  const positionsCollection = createListCollection({
    items: [
      { label: "Frontend Engineer", value: "frontend" },
      { label: "Backend Engineer", value: "backend" },
      { label: "Full Stack Engineer", value: "fullstack" },
      { label: "DevOps Engineer", value: "devops" },
      { label: "Mobile Engineer", value: "mobile" },
    ],
  });

  const departmentsCollection = createListCollection({
    items: [
      { label: "Engineering", value: "engineering" },
      { label: "Product", value: "product" },
      { label: "Design", value: "design" },
      { label: "Data Science", value: "data" },
      { label: "Security", value: "security" },
    ],
  });

  const experienceLevelsCollection = createListCollection({
    items: [
      { label: "Junior (0-2 years)", value: "junior" },
      { label: "Mid-Level (3-5 years)", value: "mid" },
      { label: "Senior (6-10 years)", value: "senior" },
      { label: "Lead (10+ years)", value: "lead" },
    ],
  });

  return (
    <div className="chakra-form-wrapper">
      <Container maxW="container.md" py={8}>
        <Box bg="white" p={8} borderRadius="lg" boxShadow="lg" color="gray.800">
          <Heading as="h1" size="xl" mb={6} color="gray.900">
            Senior Software Engineer Application
          </Heading>

          {submitted && (
            <Alert.Root role="alert" status="success" mb={6} borderRadius="md">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Success!</Alert.Title>
                <Alert.Description>
                  Application submitted successfully! We'll review your
                  information and get back to you soon.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <VStack gap={6} alignItems="stretch">
              <Box>
                <Heading as="h2" size="md" mb={4} color="gray.700">
                  Personal Information
                </Heading>
                <Separator mb={4} />

                <VStack gap={4} alignItems="stretch">
                  <Field.Root required>
                    <Field.Label>Full Name</Field.Label>
                    <Input
                      name="fullname"
                      value={formData.fullName}
                      onChange={handleChange("fullName")}
                      placeholder="John Doe"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Email Address</Field.Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      placeholder="john@example.com"
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Phone Number</Field.Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange("phone")}
                      placeholder="+1 (555) 000-0000"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>LinkedIn Profile</Field.Label>
                    <Input
                      name="linkedin"
                      value={formData.linkedIn}
                      onChange={handleChange("linkedIn")}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Portfolio Website</Field.Label>
                    <Input
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange("portfolio")}
                      placeholder="https://yourportfolio.com"
                    />
                  </Field.Root>
                </VStack>
              </Box>

              <Box>
                <Heading as="h2" size="md" mb={4} color="gray.700">
                  Position Details
                </Heading>
                <Separator mb={4} />

                <VStack gap={4} alignItems="stretch">
                  <Field.Root required>
                    <Field.Label>Position Applying For</Field.Label>
                    <SelectRoot
                      name="position"
                      collection={positionsCollection}
                      value={[formData.position]}
                      onValueChange={(details) =>
                        setFormData({ ...formData, position: details.value[0] })
                      }
                      size="md"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionsCollection.items.map((item) => (
                          <SelectItem key={item.value} item={item}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Department</Field.Label>
                    <SelectRoot
                      name="department"
                      collection={departmentsCollection}
                      value={[formData.department]}
                      onValueChange={(details) =>
                        setFormData({
                          ...formData,
                          department: details.value[0],
                        })
                      }
                      size="md"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentsCollection.items.map((item) => (
                          <SelectItem key={item.value} item={item}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label>Experience Level</Field.Label>
                    <SelectRoot
                      name="experienceLevel"
                      collection={experienceLevelsCollection}
                      value={[formData.experienceLevel]}
                      onValueChange={(details) =>
                        setFormData({
                          ...formData,
                          experienceLevel: details.value[0],
                        })
                      }
                      size="md"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevelsCollection.items.map((item) => (
                          <SelectItem key={item.value} item={item}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Technical Skills</Field.Label>
                    <SelectRoot
                      name="skills"
                      collection={createListCollection({
                        items: skillsList
                          .filter((skill) => !formData.skills.includes(skill))
                          .map((skill) => ({ label: skill, value: skill })),
                      })}
                      onValueChange={(details) => {
                        const skill = details.value[0];
                        if (skill && !formData.skills.includes(skill)) {
                          handleSkillToggle(skill);
                        }
                      }}
                      size="md"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Add skills" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillsList
                          .filter((skill) => !formData.skills.includes(skill))
                          .map((skill) => (
                            <SelectItem
                              key={skill}
                              item={{ label: skill, value: skill }}
                            >
                              {skill}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </SelectRoot>
                    <Field.HelperText>Select all that apply</Field.HelperText>
                    <Wrap gap={2} mb={2}>
                      {formData.skills.map((skill) => (
                        <Tag.Root
                          key={skill}
                          size="md"
                          colorPalette="blue"
                          borderRadius="full"
                        >
                          <Tag.Label>{skill}</Tag.Label>
                          <Tag.CloseTrigger
                            onClick={() => handleSkillToggle(skill)}
                          />
                        </Tag.Root>
                      ))}
                    </Wrap>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Preferred Work Locations</Field.Label>
                    <Box position="relative" width="100%">
                      <Input
                        name="preferredLocations"
                        placeholder="Select cities"
                        value={locationInput}
                        onChange={(e) => {
                          setLocationInput(e.target.value);
                          setShowLocationDropdown(true);
                        }}
                        onFocus={() => setShowLocationDropdown(true)}
                        onBlur={() => {
                          setTimeout(() => setShowLocationDropdown(false), 200);
                        }}
                      />
                      {showLocationDropdown && locationInput && (
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          bg="white"
                          borderWidth="1px"
                          borderColor="gray.300"
                          borderRadius="md"
                          boxShadow="md"
                          maxH="200px"
                          overflowY="auto"
                          zIndex={10}
                          mt={1}
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
                              <Box
                                key={city}
                                px={3}
                                py={2}
                                role="option"
                                cursor="pointer"
                                _hover={{ bg: "gray.100" }}
                                onClick={() => {
                                  if (
                                    !formData.preferredLocations.includes(city)
                                  ) {
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
                              </Box>
                            ))}
                        </Box>
                      )}
                    </Box>
                    <Wrap gap={2} mt={2}>
                      {formData.preferredLocations.map((location) => (
                        <Tag.Root
                          key={location}
                          size="md"
                          colorPalette="green"
                          borderRadius="full"
                        >
                          <Tag.Label>{location}</Tag.Label>
                          <Tag.CloseTrigger
                            onClick={() => handleLocationToggle(location)}
                          />
                        </Tag.Root>
                      ))}
                    </Wrap>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>
                      Years of Experience: {formData.yearsExperience}
                    </Field.Label>
                    <Slider.Root
                      name="yearsExperience"
                      value={[formData.yearsExperience]}
                      onValueChange={(details) =>
                        setFormData({
                          ...formData,
                          yearsExperience: details.value[0],
                        })
                      }
                      min={0}
                      max={20}
                      step={1}
                      width="100%"
                    >
                      <Slider.Control>
                        <Slider.Track bg="gray.200">
                          <Slider.Range bg="blue.500" />
                        </Slider.Track>
                        <Slider.Thumb index={0} />
                      </Slider.Control>
                    </Slider.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>
                      Rate Your Overall Technical Proficiency
                    </Field.Label>
                    <RatingGroup.Root
                      name="rate"
                      count={5}
                      value={formData.selfRating ?? 0}
                      onValueChange={(details) =>
                        setFormData({ ...formData, selfRating: details.value })
                      }
                    >
                      <RatingGroup.HiddenInput />
                      <RatingGroup.Control />
                    </RatingGroup.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Employment Type Preference</Field.Label>
                    <RadioGroup.Root
                      name="employmentType"
                      value={formData.employmentType}
                      onValueChange={(details) =>
                        setFormData({
                          ...formData,
                          employmentType: details.value || "",
                        })
                      }
                    >
                      <Stack gap={2}>
                        <RadioGroup.Item value="fulltime">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>Full-Time</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="parttime">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>Part-Time</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="contract">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>Contract</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="freelance">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>Freelance</RadioGroup.ItemText>
                        </RadioGroup.Item>
                      </Stack>
                    </RadioGroup.Root>
                  </Field.Root>

                  <Fieldset.Root>
                    <CheckboxGroup
                      name="workPreferences"
                      value={formData.workPreferences}
                      onValueChange={(value) => {
                        setFormData({ ...formData, workPreferences: value });
                      }}
                    >
                      <Fieldset.Legend fontSize="sm" mb="2">
                        Work Location Preferences
                      </Fieldset.Legend>
                      <Fieldset.Content>
                        <Stack gap={2}>
                          <For each={workLocationOptions}>
                            {(value) => (
                              <Checkbox.Root key={value} value={value}>
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label>
                                  {workLocationLabels[value]}
                                </Checkbox.Label>
                              </Checkbox.Root>
                            )}
                          </For>
                        </Stack>
                      </Fieldset.Content>
                    </CheckboxGroup>
                  </Fieldset.Root>

                  <Fieldset.Root>
                    <CheckboxGroup
                      name="benefits"
                      value={formData.benefits}
                      onValueChange={(value) => {
                        setFormData({ ...formData, benefits: value });
                      }}
                    >
                      <Fieldset.Legend fontSize="sm" mb="2">
                        Important Benefits (Select all that apply)
                      </Fieldset.Legend>
                      <Fieldset.Content>
                        <Stack gap={2}>
                          <For each={benefitOptions}>
                            {(benefit) => (
                              <Checkbox.Root key={benefit} value={benefit}>
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label>{benefit}</Checkbox.Label>
                              </Checkbox.Root>
                            )}
                          </For>
                        </Stack>
                      </Fieldset.Content>
                    </CheckboxGroup>
                  </Fieldset.Root>

                  <Field.Root>
                    <Field.Label>Open to Relocation?</Field.Label>
                    <RadioGroup.Root
                      name="relocation"
                      value={formData.relocation}
                      onValueChange={(details) =>
                        setFormData({
                          ...formData,
                          relocation: details.value || "",
                        })
                      }
                    >
                      <Stack gap={2}>
                        <RadioGroup.Item value="yes">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>Yes</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="no">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>No</RadioGroup.ItemText>
                        </RadioGroup.Item>
                        <RadioGroup.Item value="maybe">
                          <RadioGroup.ItemHiddenInput />
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>
                            Maybe, depends on location
                          </RadioGroup.ItemText>
                        </RadioGroup.Item>
                      </Stack>
                    </RadioGroup.Root>
                  </Field.Root>

                  <Flex alignItems="center" gap={4}>
                    <Switch.Root
                      id="immediateStart"
                      checked={formData.immediateStart}
                      onCheckedChange={(e) =>
                        setFormData({
                          ...formData,
                          immediateStart: e.checked === true,
                        })
                      }
                    >
                      <Switch.HiddenInput />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch.Root>
                    <Text flex="1">Available for Immediate Start</Text>
                  </Flex>

                  <Flex alignItems="center" gap={4}>
                    <Switch.Root
                      id="referral"
                      checked={formData.referral}
                      onCheckedChange={(e) =>
                        setFormData({
                          ...formData,
                          referral: e.checked === true,
                        })
                      }
                    >
                      <Switch.HiddenInput />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch.Root>
                    <Text flex="1">Were you referred by an employee?</Text>
                  </Flex>

                  <Field.Root>
                    <Field.Label>Available Start Date</Field.Label>
                    <Input
                      type="date"
                      name="availableFrom"
                      value={formData.availableFrom}
                      onChange={handleChange("availableFrom")}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>
                      Salary Expectation: $
                      {formData.salaryExpectation.toLocaleString()}
                    </Field.Label>
                    <Slider.Root
                      name="salaryExpectation"
                      value={[formData.salaryExpectation]}
                      onValueChange={(details) =>
                        setFormData({
                          ...formData,
                          salaryExpectation: details.value[0],
                        })
                      }
                      min={30000}
                      max={250000}
                      step={5000}
                      width="100%"
                    >
                      <Slider.Control>
                        <Slider.Track bg="gray.200">
                          <Slider.Range bg="blue.500" />
                        </Slider.Track>
                        <Slider.Thumb index={0} />
                      </Slider.Control>
                    </Slider.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Cover Letter</Field.Label>
                    <Textarea
                      name="coverLetter"
                      value={formData.coverLetter}
                      onChange={handleChange("coverLetter")}
                      placeholder="Tell us why you're interested in this position..."
                      rows={6}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Key Achievements</Field.Label>
                    <Textarea
                      name="achievements"
                      value={formData.achievements}
                      onChange={handleChange("achievements")}
                      placeholder="List your most significant professional achievements..."
                      rows={4}
                    />
                  </Field.Root>
                </VStack>
              </Box>

              <Button
                type="submit"
                colorPalette="blue"
                size="lg"
                width="full"
                mt={4}
              >
                Submit Application
              </Button>
            </VStack>
          </form>
        </Box>
      </Container>
    </div>
  );
}
