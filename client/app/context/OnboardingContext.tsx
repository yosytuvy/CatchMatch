// app/context/OnboardingContext.tsx

import React, { createContext, useContext, useState, ReactNode } from "react";

interface OnboardingData {
  fullName: string;
  dob: string;
  gender: "female" | "male" | null;
  lookingFor: "gents" | "ladies" | null;
  relationshipType: string | null;
  ageRange: [number, number];
  images: (string | null)[];
  city: string | null;
  about: string;
  height: string;
  smokes: "yes" | "no" | "";
  hobbies: string[];
  instagram: string;
  tiktok: string;
  // New field to hold the created profile's ID
  profileId: string | null;
}

interface ContextProps extends OnboardingData {
  setFullName: (v: string) => void;
  setDob: (v: string) => void;
  setGender: (v: "female" | "male") => void;
  setLookingFor: (v: "gents" | "ladies") => void;
  setRelationshipType: (v: string) => void;
  setAgeRange: (v: [number, number]) => void;
  setImages: (v: (string | null)[]) => void;
  setCity: (v: string) => void;
  setAbout: (v: string) => void;
  setHeight: (v: string) => void;
  setSmokes: (v: "yes" | "no" | "") => void;
  setHobbies: (v: string[]) => void;
  setInstagram: (v: string) => void;
  setTiktok: (v: string) => void;
  // Setter for profileId
  setProfileId: (v: string) => void;
}

const OnboardingContext = createContext<ContextProps>(null!);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<ContextProps["gender"]>(null);
  const [lookingFor, setLookingFor] = useState<ContextProps["lookingFor"]>(null);
  const [relationshipType, setRelationshipType] = useState<string | null>(null);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);
  const [city, setCity] = useState<string | null>(null);
  const [about, setAbout] = useState("");
  const [height, setHeight] = useState("");
  const [smokes, setSmokes] = useState<"yes" | "no" | "">("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  // New state for profileId
  const [profileId, setProfileId] = useState<string | null>(null);

  return (
    <OnboardingContext.Provider
      value={{
        fullName,
        dob,
        gender,
        lookingFor,
        relationshipType,
        ageRange,
        images,
        city,
        about,
        height,
        smokes,
        hobbies,
        instagram,
        tiktok,
        profileId,
        setFullName,
        setDob,
        setGender,
        setLookingFor,
        setRelationshipType,
        setAgeRange,
        setImages,
        setCity,
        setAbout,
        setHeight,
        setSmokes,
        setHobbies,
        setInstagram,
        setTiktok,
        // Expose the new setter
        setProfileId,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
