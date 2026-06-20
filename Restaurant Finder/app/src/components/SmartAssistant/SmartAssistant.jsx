import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { X, ArrowRight, CheckCircle2, HeartHandshake } from "lucide-react";
import { getAIDiningRecommendationFromSurvey, fetchRestaurants } from "@/data/restaurants";

const moodOptions = [
  {
    id: "local-favorite",
    title: "Local favorite",
    description: "Places loved by nearby diners and reviewers.",
  },
  {
    id: "date-night",
    title: "Date night",
    description: "Intimate and memorable settings for two.",
  },
  {
    id: "quick-bite",
    title: "Quick bite",
    description: "Fast, tasty, and wallet-friendly choices.",
  },
  {
    id: "group-dinner",
    title: "Group dinner",
    description: "Lively spots with room for the whole crew.",
  },
];

const cuisineOptions = [
  "Any cuisine",
  "Italian",
  "Japanese",
  "Mexican",
  "Indian",
  "Chinese",
  "American",
  "Seafood",
  "French",
];

const budgetOptions = [
  { id: "economy", label: "Budget friendly" },
  { id: "moderate", label: "Moderate" },
  { id: "premium", label: "Premium" },
];

const dietOptions = [
  { id: "none", label: "No special diet" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "low-sodium", label: "Low sodium / heart friendly" },
  { id: "diabetes-friendly", label: "Diabetes-friendly" },
];

const partyOptions = [
  { id: "solo", label: "Solo meal" },
  { id: "couple", label: "Couple / date" },
  { id: "group", label: "Group or family" },
  { id: "business", label: "Business meeting" },
];

const heightOptions = [
  { id: "under-160-cm", label: "Under 160 cm" },
  { id: "160-170-cm", label: "160 - 170 cm" },
  { id: "170-180-cm", label: "170 - 180 cm" },
  { id: "180-190-cm", label: "180 - 190 cm" },
  { id: "190-cm-plus", label: "190 cm or taller" },
];

const weightOptions = [
  { id: "under-60-kg", label: "Under 60 kg" },
  { id: "60-75-kg", label: "60 - 75 kg" },
  { id: "75-90-kg", label: "75 - 90 kg" },
  { id: "90-105-kg", label: "90 - 105 kg" },
  { id: "105-kg-plus", label: "105 kg or more" },
];

const medicalOptions = [
  { id: "none", label: "No medical conditions" },
  { id: "high-blood-pressure", label: "High blood pressure" },
  { id: "diabetes", label: "Diabetes" },
  { id: "gluten-allergy", label: "Gluten allergy" },
  { id: "dairy-sensitivity", label: "Dairy sensitivity" },
  { id: "heart-condition", label: "Heart condition" },
  { id: "weight-management", label: "Weight management focus" },
];

const defaultAnswers = {
  mood: "local-favorite",
  cuisine: "Any cuisine",
  budget: "moderate",
  diet: "none",
  partySize: "solo",
  height: "170-180-cm",
  weight: "60-75-kg",
  medicalCondition: "none",
};

export default function SmartAssistant({
  restaurants,
  activeCategory,
  user,
  savedRestaurants,
  viewHistory,
  open,
  initialAnswers,
  onSaveAnswers,
  onClose,
}) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers || defaultAnswers);
  const [showResultPage, setShowResultPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [additionalRestaurants, setAdditionalRestaurants] = useState([]);
  const previousOpenRef = useRef(false);

  // Fetch additional restaurants when a specific cuisine is selected
  useEffect(() => {
    if (!answers.cuisine || answers.cuisine === "Any cuisine") {
      setAdditionalRestaurants([]);
      return;
    }

    // Only fetch if we don't already have enough restaurants of this type
    const cuisineNormalized = answers.cuisine.toLowerCase();
    const currentCount = restaurants.filter(r => 
      r.cuisine?.toLowerCase().includes(cuisineNormalized) ||
      r.cuisineName?.toLowerCase().includes(cuisineNormalized)
    ).length;

    console.log(`[SmartAssistant] ===== CUISINE SELECTION =====`);
    console.log(`[SmartAssistant] Cuisine Selected: ${answers.cuisine}`);
    console.log(`[SmartAssistant] Current count in initial data: ${currentCount}`);
    console.log(`[SmartAssistant] Total initial restaurants: ${restaurants.length}`);
    console.log(`[SmartAssistant] Initial restaurants cuisines:`, restaurants.map(r => r.cuisineName).slice(0, 5));

    if (currentCount < 10) {
      // Fetch more restaurants of this cuisine
      console.log(`[SmartAssistant] FETCHING additional ${answers.cuisine} restaurants (limit: 30)...`);
      const startTime = Date.now();
      fetchRestaurants({
        categories: cuisineNormalized,
        limit: 30,
      })
        .then(data => {
          const fetchTime = Date.now() - startTime;
          console.log(`[SmartAssistant] ===== FETCH COMPLETE (${fetchTime}ms) =====`);
          console.log(`[SmartAssistant] Fetched ${data?.length || 0} restaurants for ${answers.cuisine}`);
          if (data && data.length > 0) {
            console.log(`[SmartAssistant] First 3 fetched restaurants:`, data.slice(0, 3).map(r => ({ name: r.name, cuisine: r.cuisineName })));
          }
          setAdditionalRestaurants(data || []);
        })
        .catch(err => {
          console.error(`[SmartAssistant] FETCH FAILED: ${err.message}`);
          setAdditionalRestaurants([]);
        });
    } else {
      console.log(`[SmartAssistant] Sufficient restaurants already in initial data, not fetching`);
      setAdditionalRestaurants([]);
    }
  }, [answers.cuisine, restaurants]);

  useEffect(() => {
    if (!open) {
      previousOpenRef.current = false;
      return;
    }
    
    if (!previousOpenRef.current) {
      setAnswers(initialAnswers || defaultAnswers);
      setStep(1);
      setShowResultPage(false);
      setIsLoading(false);
      previousOpenRef.current = true;
    }
  }, [open]);

  const recommendation = useMemo(
    () => {
      // Combine original restaurants with additional cuisine-specific restaurants
      const allRestaurants = additionalRestaurants.length > 0 
        ? [...restaurants, ...additionalRestaurants]
        : restaurants;
      
      return getAIDiningRecommendationFromSurvey({
        restaurants: allRestaurants,
        answers,
        category: activeCategory,
        user,
        saved: savedRestaurants,
        history: viewHistory,
      });
    },
    [restaurants, additionalRestaurants, answers, activeCategory, user, savedRestaurants, viewHistory],
  );

  const questionText = [
    "What kind of dining experience are you looking for?",
    "Do you have a preferred cuisine?",
    "What is your budget?",
    "Any dietary or health needs?",
    "Who are you dining with?",
    "What is your height range?",
    "What is your weight range?",
    "Any medical or health conditions we should consider?",
  ];

  const canContinue = () => {
    if (step === 1) return answers.mood;
    if (step === 2) return answers.cuisine;
    if (step === 3) return answers.budget;
    if (step === 4) return answers.diet;
    if (step === 5) return answers.partySize;
    if (step === 6) return answers.height;
    if (step === 7) return answers.weight;
    if (step === 8) return answers.medicalCondition;
    return true;
  };

  const handleSelect = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    if (step < 8) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleFinish = () => {
    onSaveAnswers?.(answers);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowResultPage(true);
    }, 1200);
  };

  const handleConfirmSelection = () => {
    setShowResultPage(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto px-4 py-8"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mx-auto flex max-w-4xl flex-col gap-6 rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-2xl sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">
              AI dining assistant
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Let us recommend the best restaurant for you.
            </h2>
            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Answer a few quick questions and we’ll match you with the ideal spot, including dietary and health-friendly options.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-gray-200 bg-white p-3 text-gray-600 shadow-sm transition hover:bg-gray-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`transition-all duration-500 ease-out ${showResultPage ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 max-h-[4000px]"}`}>
          <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-6 rounded-[28px] border border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Step {step} of 8
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-orange-700">
                  {answers.mood === "local-favorite" ? "Classic" : step === 8 ? "Ready" : "Guide"}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {questionText[step - 1]}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {step === 4
                    ? "We’ll use this to suggest restaurants that fit your health or allergy needs."
                    : step === 6
                    ? "Your height helps us understand portion and seating recommendations."
                    : step === 7
                    ? "Your weight range helps the assistant suggest meals that match your health goals."
                    : step === 8
                    ? "Choose any medical condition or wellness focus so the recommendation is more suitable."
                    : "Choose the option that best describes what you need tonight."}
                </p>
              </div>

              <div className="grid gap-3">
                {step === 1 &&
                  moodOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect("mood", option.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        answers.mood === option.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">{option.title}</h4>
                          <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                        </div>
                        {answers.mood === option.id ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                {step === 2 &&
                  cuisineOptions.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleSelect("cuisine", label)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        answers.cuisine === label
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold text-gray-900">{label}</span>
                        {answers.cuisine === label ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                {step === 3 &&
                  budgetOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect("budget", option.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        answers.budget === option.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold text-gray-900">{option.label}</span>
                        {answers.budget === option.id ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : null}
                      </div>
                    </button>
                  ))}              {step === 4 &&
                  dietOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect("diet", option.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        answers.diet === option.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold text-gray-900">{option.label}</span>
                        {answers.diet === option.id ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                {step === 5 &&
                  partyOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect("partySize", option.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        answers.partySize === option.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold text-gray-900">{option.label}</span>
                        {answers.partySize === option.id ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                {step === 6 &&
                  heightOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect("height", option.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        answers.height === option.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold text-gray-900">{option.label}</span>
                        {answers.height === option.id ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                {step === 7 &&
                  weightOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect("weight", option.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        answers.weight === option.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold text-gray-900">{option.label}</span>
                        {answers.weight === option.id ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : null}
                      </div>
                    </button>
                  ))}
                {step === 8 &&
                  medicalOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect("medicalCondition", option.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        answers.medicalCondition === option.id
                          ? "border-orange-400 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-base font-semibold text-gray-900">{option.label}</span>
                        {answers.medicalCondition === option.id ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-500" />
                        ) : null}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Your current answer</h3>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <p>
                  <span className="font-semibold text-gray-900">Mood:</span> {moodOptions.find((item) => item.id === answers.mood)?.title}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Cuisine:</span> {answers.cuisine}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Budget:</span> {budgetOptions.find((item) => item.id === answers.budget)?.label}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Dietary need:</span> {dietOptions.find((item) => item.id === answers.diet)?.label}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Dining party:</span> {partyOptions.find((item) => item.id === answers.partySize)?.label}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Height:</span> {heightOptions.find((item) => item.id === answers.height)?.label}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Weight:</span> {weightOptions.find((item) => item.id === answers.weight)?.label}
                </p>
                <p>
                  <span className="font-semibold text-gray-900">Medical condition:</span> {medicalOptions.find((item) => item.id === answers.medicalCondition)?.label}
                </p>
              </div>

              <div className="mt-6 rounded-3xl bg-orange-50 p-5">
                <div className="flex items-center gap-3 text-orange-700">
                  <HeartHandshake className="w-5 h-5" />
                  <p className="text-sm font-semibold">Smart match ready</p>
                </div>
                <p className="mt-3 text-sm text-orange-700">
                  The assistant will use your selections to pick a restaurant that fits your current needs and preferences.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="flex-1 rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={step < 8 ? goNext : handleFinish}
                  disabled={!canContinue()}
                  className="flex-1 rounded-3xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {step < 8 ? "Next question" : "Finish"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center rounded-[32px] bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-orange-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-600 border-r-orange-600 animate-spin"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Finding your perfect match...</h3>
              <p className="mt-3 text-base text-gray-600">Analyzing your preferences and recommendations</p>
            </div>
          </div>
        )}

        <div className={`${showResultPage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"} transition-all duration-500 ease-out ${showResultPage ? "block" : "hidden"}`}>
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">
                  AI recommendation
                </p>
                <h2 className="mt-3 text-3xl font-bold text-gray-900">
                  {recommendation?.recommendation?.name || recommendation?.name || "No restaurant found"}
                </h2>
                <p className="mt-3 text-sm text-gray-600 sm:text-base">
                  {recommendation?.recommendation
                    ? `${recommendation.recommendation.cuisineName} · ${recommendation.recommendation.location}`
                    : recommendation?.name
                    ? `${recommendation.cuisineName} · ${recommendation.location}`
                    : "Try again with different preferences to get a recommendation."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleConfirmSelection}
                className="rounded-full border border-gray-200 bg-white p-3 text-gray-600 shadow-sm transition hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {recommendation?.recommendation && (
              <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-900">Why this restaurant?</p>
                <p className="mt-2 text-sm text-gray-600">{recommendation.reason}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {recommendation?.recommendation && (
                <Link
                  to={`/restaurant/${recommendation.recommendation.id}`}
                  className="inline-flex flex-1 items-center justify-center rounded-3xl bg-orange-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-700"
                  onClick={handleConfirmSelection}
                >
                  Open restaurant page
                </Link>
              )}
              <button
                type="button"
                onClick={handleConfirmSelection}
                className="inline-flex flex-1 items-center justify-center rounded-3xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
