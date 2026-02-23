"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquationSelector } from "@/components/forms/EquationSelector";
import { DynamicForm } from "@/components/forms/DynamicForm";
import { NaturalLanguageInput } from "@/components/forms/NaturalLanguageInput";
import { SolutionDisplay } from "@/components/solution/SolutionDisplay";
import { ValidationAlert } from "@/components/solution/ValidationAlert";
import { KINEMATIC_EQUATIONS } from "@/lib/physics/equations/kinematics";
import { DYNAMICS_EQUATIONS } from "@/lib/physics/equations/dynamics";
import { ENERGY_EQUATIONS } from "@/lib/physics/equations/energy";
import { MOMENTUM_EQUATIONS } from "@/lib/physics/equations/momentum";
import { THERMO_EQUATIONS } from "@/lib/physics/equations/thermodynamics";
import { ROTATIONAL_EQUATIONS } from "@/lib/physics/equations/rotational";
import { WAVE_EQUATIONS } from "@/lib/physics/equations/waves";
import { ADVANCED_EQUATIONS } from "@/lib/physics/equations/advanced";
import { ConstantsLibrary } from "@/components/forms/ConstantsLibrary";
import {
  validateSolverInputs,
  normalizeVariables,
  inferEquation,
  generateDiagnosticMessage
} from "@/lib/physics/solver-validator";
import { Calculator, Sparkles } from "lucide-react";
import { supabase } from "@/lib/db/supabase";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [selectedEquationId, setSelectedEquationId] = useState<string>("v1");
  const [category, setCategory] = useState<"kinematics" | "dynamics" | "energy" | "momentum" | "thermodynamics" | "rotational" | "waves" | "advanced">("kinematics");
  const [activeTab, setActiveTab] = useState<string>("form");
  const [interpretation, setInterpretation] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [solution, setSolution] = useState<{
    result: number;
    solveFor: string;
    steps: Array<{ description: string; formula?: string; isMath?: boolean }>;
    inputValues?: Record<string, number>;
    category?: string;
    equationId?: string;
  } | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && ["kinematics", "dynamics", "energy", "momentum", "thermodynamics", "rotational", "waves", "advanced"].includes(cat)) {
      setCategory(cat as any);
      // Set default equation for the category
      if (cat === "kinematics") setSelectedEquationId("v1");
      else if (cat === "dynamics") setSelectedEquationId("f1");
      else if (cat === "energy") setSelectedEquationId("work1");
      else if (cat === "momentum") setSelectedEquationId("p1");
      else if (cat === "thermodynamics") setSelectedEquationId("pv1");
      else if (cat === "rotational") setSelectedEquationId("rot_tau1");
      else if (cat === "waves") setSelectedEquationId("wave_v1");
      else if (cat === "advanced") setSelectedEquationId("lag_1");

      setSolution(null);
      setInterpretation(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Ensure profile exists (fallback for existing users/trigger issues)
        try {
          const { data: profiles, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id);

          if (!fetchError && (!profiles || profiles.length === 0)) {
            console.log("No profile found, creating one...");
            const { error: insertError } = await supabase.from('profiles').insert({
              id: user.id,
              display_name: user.user_metadata?.display_name || user.email?.split('@')[0]
            });
            if (insertError) {
              // Ignore duplicate key error (means profile exists)
              if ((insertError as any).code !== '23505') {
                console.error("Could not create profile fallback:", insertError.message);
              }
            }
          }
        } catch (err) {
          console.error("Profile check failed:", err);
        }
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const saveToHistory = async (problemText: string, problemType: string, inputMethod: "form" | "nl", inputValues: any, steps: any[], result: number, solveFor: string) => {
    if (!user) return;

    try {
      // 1. Save problem
      const { data: problem, error: pError } = await supabase
        .from('problems')
        .insert({
          user_id: user.id,
          problem_text: problemText,
          problem_type: problemType,
          input_method: inputMethod
        })
        .select()
        .single();

      if (pError) throw pError;

      // 2. Save solution
      const { error: sError } = await supabase
        .from('solutions')
        .insert({
          problem_id: problem.id,
          input_values: inputValues,
          solution_steps: steps,
          final_answer: { result, solveFor }
        });

      if (sError) throw sError;

      console.log("Saved to history successfully");
    } catch (err: any) {
      console.error("Error saving to history:", err.message || err);
      if (err.details) console.error("Details:", err.details);
      if (err.hint) console.error("Hint:", err.hint);
    }
  };

  const handleEquationSelect = (id: string) => {
    setSelectedEquationId(id);
    setSolution(null);
    setInterpretation(null);
  };

  const getEquationById = (id: string) => {
    return [...KINEMATIC_EQUATIONS, ...DYNAMICS_EQUATIONS, ...ENERGY_EQUATIONS, ...MOMENTUM_EQUATIONS, ...THERMO_EQUATIONS, ...ROTATIONAL_EQUATIONS, ...WAVE_EQUATIONS, ...ADVANCED_EQUATIONS].find(eq => eq.id === id);
  };

  const generateSteps = (equation: any, values: any, solveFor: string, result: number, currentCategory: string) => {
    let substitution = `${solveFor} = \\dots`;

    if (currentCategory === 'kinematics') {
      const v0 = values.v0 ?? "?";
      const a = values.a ?? "?";
      const t = values.t ?? "?";
      const v = values.v ?? "?";
      const x = values.x ?? "?";
      const x0 = values.x0 ?? "?";

      if (equation.id === 'v1') {
        if (solveFor === 'v') substitution = `v = (${v0}) + (${a})(${t})`;
        if (solveFor === 'v0') substitution = `v_0 = (${v}) - (${a})(${t})`;
        if (solveFor === 'a') substitution = `a = \\frac{(${v}) - (${v0})}{${t}}`;
        if (solveFor === 't') substitution = `t = \\frac{(${v}) - (${v0})}{${a}}`;
      } else if (equation.id === 'x1') {
        if (solveFor === 'x') substitution = `x = (${x0}) + (${v0})(${t}) + \\frac{1}{2}(${a})(${t})^2`;
      } else if (equation.id === 'v2') {
        if (solveFor === 'v') substitution = `v = \\sqrt{(${v0})^2 + 2(${a})((${x}) - (${x0}))}`;
      } else if (equation.id === 'x2') {
        if (solveFor === 'x') substitution = `x = (${x0}) + \\frac{1}{2}((${v}) + (${v0}))(${t})`;
      }
    } else if (currentCategory === 'dynamics') {
      // Dynamics substitutions
      const F = values.F ?? "?";
      const m = values.m ?? "?";
      const a = values.a ?? "?";
      const mu = values.mu ?? "?";
      const N = values.N ?? "?";
      const f = values.f ?? "?";
      const W = values.W ?? "?";
      const g = values.g ?? "9.81";

      if (equation.id === 'f1') {
        if (solveFor === 'F') substitution = `F = (${m})(${a})`;
        if (solveFor === 'm') substitution = `m = \\frac{${F}}{${a}}`;
        if (solveFor === 'a') substitution = `a = \\frac{${F}}{${m}}`;
      } else if (equation.id === 'w1') {
        if (solveFor === 'W') substitution = `W = (${m})(${g})`;
        if (solveFor === 'm') substitution = `m = \\frac{${W}}{${g}}`;
      } else if (equation.id === 'ff1') {
        let nDisplay = N;
        if ((N === "?" || N === 0) && m !== "?") nDisplay = `(${m} \\times ${g})`;

        if (solveFor === 'f') substitution = `f = (${mu})(${nDisplay})`;
        if (solveFor === 'mu') substitution = `\\mu = \\frac{${f}}{${nDisplay}}`;
        if (solveFor === 'N') substitution = `N = \\frac{${f}}{${mu}}`;
      }
    } else if (currentCategory === 'energy') {
      // Energy substitutions
      const W = values.W ?? "?";
      const F = values.F ?? "?";
      const d = values.d ?? "?";
      const theta = values.theta ?? "0";
      const K = values.K ?? "?";
      const m = values.m ?? "?";
      const v = values.v ?? "?";
      const U = values.U ?? "?";
      const g = values.g ?? "9.81";
      const h = values.h ?? "?";
      const P = values.P ?? "?";
      const t = values.t ?? "?";

      if (equation.id === 'work1') {
        if (solveFor === 'W') substitution = `W = (${F})(${d}) \\cos(${theta}^\\circ)`;
        if (solveFor === 'F') substitution = `F = \\frac{${W}}{(${d}) \\cos(${theta}^\\circ)}`;
      } else if (equation.id === 'ke1') {
        if (solveFor === 'K') substitution = `K = \\frac{1}{2}(${m})(${v})^2`;
      } else if (equation.id === 'pe1') {
        if (solveFor === 'U') substitution = `U = (${m})(${g})(${h})`;
      } else if (equation.id === 'power1') {
        if (solveFor === 'P') substitution = `P = \\frac{${values.W ?? "W"}}{${values.t ?? "t"}}`;
      }
    } else if (currentCategory === 'momentum') {
      const p = values.p ?? "p";
      const m = values.m ?? "m";
      const v = values.v ?? "v";
      const F = values.F ?? "F";
      const dt = values.dt ?? "\\Delta t";
      const J = values.J ?? "J";
      const vi = values.vi ?? "v_i";
      const vf = values.vf ?? "v_f";

      if (equation.id === 'p1') {
        if (solveFor === 'p') substitution = `p = (${m})(${v})`;
        if (solveFor === 'm') substitution = `m = \\frac{${p}}{${v}}`;
        if (solveFor === 'v') substitution = `v = \\frac{${p}}{${m}}`;
      } else if (equation.id === 'j1') {
        if (solveFor === 'J') substitution = `J = (${F})(${dt})`;
        if (solveFor === 'F') substitution = `F = \\frac{${J}}{${dt}}`;
        if (solveFor === 'dt') substitution = `\\Delta t = \\frac{${J}}{${F}}`;
      } else if (equation.id === 'j2') {
        if (solveFor === 'J') substitution = `J = (${m})((${vf}) - (${vi}))`;
        if (solveFor === 'm') substitution = `m = \\frac{${J}}{(${vf}) - (${vi})}`;
        if (solveFor === 'vf') substitution = `v_f = \\frac{${J}}{${m}} + (${vi})`;
        if (solveFor === 'vi') substitution = `v_i = (${vf}) - \\frac{${J}}{${m}}`;
      }
    } else if (currentCategory === 'thermodynamics') {
      const P = values.P ?? "P";
      const V = values.V ?? "V";
      const n = values.n ?? "n";
      const T = values.T ?? "T";
      const Q = values.Q ?? "Q";
      const m = values.m ?? "m";
      const c = values.c ?? "c";
      const dT = values.dT ?? "\\Delta T";
      const L = values.L ?? "L";
      const Kavg = values.Kavg ?? "K_{avg}";
      const R = 8.314;
      const kB = "1.38 \\times 10^{-23}";

      if (equation.id === 'pv1') {
        if (solveFor === 'P') substitution = `P = \\frac{(${n})(${R})(${T})}{${V}}`;
        if (solveFor === 'V') substitution = `V = \\frac{(${n})(${R})(${T})}{${P}}`;
        if (solveFor === 'n') substitution = `n = \\frac{(${P})(${V})}{(${R})(${T})}`;
        if (solveFor === 'T') substitution = `T = \\frac{(${P})(${V})}{(${n})(${R})}`;
      } else if (equation.id === 'q1') {
        if (solveFor === 'Q') substitution = `Q = (${m})(${c})(${dT})`;
        if (solveFor === 'm') substitution = `m = \\frac{${Q}}{(${c})(${dT})}`;
        if (solveFor === 'c') substitution = `c = \\frac{${Q}}{(${m})(${dT})}`;
        if (solveFor === 'dT') substitution = `\\Delta T = \\frac{${Q}}{(${m})(${c})}`;
      } else if (equation.id === 'q2') {
        if (solveFor === 'Q') substitution = `Q = (${m})(${L})`;
        if (solveFor === 'm') substitution = `m = \\frac{${Q}}{${L}}`;
        if (solveFor === 'L') substitution = `L = \\frac{${Q}}{${m}}`;
      } else if (equation.id === 'k1') {
        if (solveFor === 'Kavg') substitution = `K_{avg} = \\frac{3}{2}(${kB})(${T})`;
        if (solveFor === 'T') substitution = `T = \\frac{${Kavg}}{\\frac{3}{2}(${kB})}`;
      }
    } else if (currentCategory === 'rotational') {
      const tau = values.tau ?? "\\tau";
      const I = values.I ?? "I";
      const alpha = values.alpha ?? "\\alpha";
      const L = values.L ?? "L";
      const omega = values.omega ?? "\\omega";
      const omega0 = values.omega0 ?? "\\omega_0";
      const Krot = values.Krot ?? "K_{rot}";
      const t = values.t ?? "t";

      if (equation.id === 'rot_tau1') {
        if (solveFor === 'tau') substitution = `\\tau = (${I})(${alpha})`;
        if (solveFor === 'I') substitution = `I = \\frac{${tau}}{${alpha}}`;
        if (solveFor === 'alpha') substitution = `\\alpha = \\frac{${tau}}{${I}}`;
      } else if (equation.id === 'rot_L1') {
        if (solveFor === 'L') substitution = `L = (${I})(${omega})`;
        if (solveFor === 'I') substitution = `I = \\frac{${L}}{${omega}}`;
        if (solveFor === 'omega') substitution = `\\omega = \\frac{${L}}{${I}}`;
      } else if (equation.id === 'rot_ke1') {
        if (solveFor === 'Krot') substitution = `K_{rot} = \\frac{1}{2}(${I})(${omega})^2`;
        if (solveFor === 'I') substitution = `I = \\frac{2(${Krot})}{(${omega})^2}`;
        if (solveFor === 'omega') substitution = `\\omega = \\sqrt{\\frac{2(${Krot})}{${I}}}`;
      } else if (equation.id === 'rot_kin1') {
        if (solveFor === 'omega') substitution = `\\omega = (${omega0}) + (${alpha})(${t})`;
        if (solveFor === 'omega0') substitution = `\\omega_0 = (${omega}) - (${alpha})(${t})`;
        if (solveFor === 'alpha') substitution = `\\alpha = \\frac{(${omega}) - (${omega0})}{${t}}`;
        if (solveFor === 't') substitution = `t = \\frac{(${omega}) - (${omega0})}{${alpha}}`;
      }
    } else if (currentCategory === 'waves') {
      const v = values.v ?? "v";
      const f = values.f ?? "f";
      const lambda = values.lambda ?? "\\lambda";
      const T = values.T ?? "T";
      const mu = values.mu ?? "\\mu";
      const Tension = values.Tension ?? "F_T";
      const omega = values.omega ?? "\\omega";

      if (equation.id === 'wave_v1') {
        if (solveFor === 'v') substitution = `v = (${f})(${lambda})`;
        if (solveFor === 'f') substitution = `f = \\frac{${v}}{${lambda}}`;
        if (solveFor === 'lambda') substitution = `\\lambda = \\frac{${v}}{${f}}`;
      } else if (equation.id === 'wave_p1') {
        if (solveFor === 'T') substitution = `T = \\frac{1}{${f}}`;
        if (solveFor === 'f') substitution = `f = \\frac{1}{${T}}`;
      } else if (equation.id === 'wave_s1') {
        if (solveFor === 'v') substitution = `v = \\sqrt{\\frac{${Tension}}{${mu}}}`;
        if (solveFor === 'Tension') substitution = `F_T = (${v})^2 (${mu})`;
        if (solveFor === 'mu') substitution = `\\mu = \\frac{${Tension}}{(${v})^2}`;
      } else if (equation.id === 'wave_a1') {
        if (solveFor === 'omega') substitution = `\\omega = 2 \\pi (${f})`;
        if (solveFor === 'f') substitution = `f = \\frac{${omega}}{2 \\pi}`;
      }
    } else if (currentCategory === 'advanced') {
      const L = values.L ?? "L";
      const H = values.H ?? "H";
      const T = values.T ?? "T";
      const V = values.V ?? "V";
      const E = values.E ?? "E";

      if (equation.id === 'lag_1') {
        if (solveFor === 'L') substitution = `L = (${T}) - (${V})`;
        if (solveFor === 'T') substitution = `T = (${L}) + (${V})`;
        if (solveFor === 'V') substitution = `V = (${T}) - (${L})`;
      } else if (equation.id === 'ham_1') {
        if (solveFor === 'H') substitution = `H = (${T}) + (${V})`;
        if (solveFor === 'T') substitution = `T = (${H}) - (${V})`;
        if (solveFor === 'V') substitution = `V = (${H}) - (${T})`;
      } else if (equation.id === 'energy_1') {
        if (solveFor === 'E') substitution = `E = (${T}) + (${V})`;
        if (solveFor === 'T') substitution = `T = (${E}) - (${V})`;
        if (solveFor === 'V') substitution = `V = (${E}) - (${T})`;
      }
    }

    return [
      { description: `Identify the target variable: ${solveFor}` },
      { description: `Apply the equation for ${equation.name}`, formula: equation.latex },
      { description: `Substitute known values`, formula: substitution },
      { description: `Final result calculated`, formula: `${solveFor} = ${result.toFixed(3)}` },
    ];
  };

  const handleSolve = (values: Record<string, number>, solveFor: string) => {
    setValidationResult(null);
    const equation = getEquationById(selectedEquationId);
    if (!equation) return;

    try {
      const result = (equation as any).solve(values, solveFor as any);
      const steps = generateSteps(equation, values, solveFor, result, category);

      setSolution({
        result,
        solveFor,
        steps,
        inputValues: values,
        category,
        equationId: selectedEquationId
      });

      // Save to history
      saveToHistory(
        `Manual Solve: ${equation.name}`,
        category,
        "form",
        values,
        steps,
        result,
        solveFor
      );
    } catch (error) {
      console.error(error);
      alert("Could not solve with the provided values.");
    }
  };

  const handleAIParse = (interp: any) => {
    let equationId = interp.equationId;

    if (!equationId) {
      if (interp.category === 'advanced') equationId = 'lag_1';
      else if (interp.category === 'waves') equationId = 'wave_v1';
      else if (interp.category === 'rotational') equationId = 'rot_tau1';
      else if (interp.category === 'thermodynamics') equationId = 'pv1';
      else if (interp.category === 'momentum') equationId = 'p1';
      else if (interp.category === 'energy') equationId = 'work1';
      else if (interp.category === 'dynamics') equationId = 'f1';
      else equationId = 'v1';
    }

    setCategory(interp.category || 'kinematics');
    setSelectedEquationId(equationId);
    setInterpretation(interp);
    setValidationResult(null); // Clear previous results

    // Step 1: Normalize variables based on category
    const normalizedValues = normalizeVariables(interp.values, interp.category);

    // Step 2: Validate inputs
    const validation = validateSolverInputs(
      normalizedValues,
      equationId,
      interp.solveFor,
      interp.category
    );

    console.log('Validation Result:', validation);

    // Step 3: If validation fails, try to recover
    if (!validation.isValid) {
      console.log('Initial validation failed, attempting recovery...');

      const inferred = inferEquation(normalizedValues, interp.solveFor);

      if (inferred && inferred.confidence >= 0.8) {
        console.log(`Inferred better match: ${inferred.category}/${inferred.equationId}`);

        // Update to inferred equation
        equationId = inferred.equationId;
        setCategory(inferred.category as any);
        setSelectedEquationId(inferred.equationId);

        // Re-validate
        const reNormalizedValues = normalizeVariables(interp.values, inferred.category);
        const reVal = validateSolverInputs(reNormalizedValues, equationId, interp.solveFor, inferred.category);

        if (reVal.isValid) {
          interp.values = reVal.normalizedValues;
          interp.category = inferred.category;
          // Continue to solve...
        } else {
          setValidationResult(reVal);
          setActiveTab("form");
          return;
        }
      } else {
        setValidationResult(validation);
        setActiveTab("form");
        return;
      }
    } else {
      interp.values = validation.normalizedValues;
    }

    // Step 4: Attempt to solve with validated/normalized values
    const equation = getEquationById(equationId);
    if (equation && interp.values && interp.solveFor) {
      try {
        const result = (equation as any).solve(interp.values, interp.solveFor);

        // Check for validity before proceeding
        if (isNaN(result) || result === null || result === undefined) {
          console.warn("Calculation resulted in N/A despite validation");
          alert("The calculation produced an invalid result. This might be due to division by zero or incompatible values. Please check the Manual Form.");
          setActiveTab("form");
          return;
        }

        const steps = generateSteps(equation, interp.values, interp.solveFor, result, interp.category);

        setSolution({
          result,
          solveFor: interp.solveFor,
          steps,
          inputValues: interp.values,
          category: interp.category,
          equationId
        });

        // Save to history
        saveToHistory(
          interp.problemText || "AI Physics Interpretation",
          interp.category || "kinematics",
          "nl",
          interp.values,
          steps,
          result,
          interp.solveFor
        );

        // Switch to form tab to show the solution
        setActiveTab("form");
      } catch (err: any) {
        console.warn("Error solving AI interpretation:", err);
        alert(`An error occurred while solving: ${err.message}\n\nPlease review the values in the Manual Form.`);
        setActiveTab("form");
        return;
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Physics Solver
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Smart physics engine with AI-powered problem interpretation.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="form" className="flex gap-2">
            <Calculator className="h-4 w-4" />
            Manual Form
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex gap-2">
            <Sparkles className="h-4 w-4" />
            AI Parser
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => {
                    setCategory("kinematics");
                    setSelectedEquationId("v1");
                    setSolution(null);
                    setInterpretation(null);
                    setValidationResult(null);
                  }}
                  className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${category === "kinematics" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                >
                  Kinematics
                </button>
                <button
                  onClick={() => {
                    setCategory("dynamics");
                    setSelectedEquationId("f1");
                    setSolution(null);
                    setInterpretation(null);
                    setValidationResult(null);
                  }}
                  className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${category === "dynamics" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                >
                  Dynamics
                </button>
                <button
                  onClick={() => {
                    setCategory("energy");
                    setSelectedEquationId("work1");
                    setSolution(null);
                    setInterpretation(null);
                    setValidationResult(null);
                  }}
                  className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${category === "energy" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                >
                  Energy
                </button>
                <button
                  onClick={() => {
                    setCategory("momentum");
                    setSelectedEquationId("p1");
                    setSolution(null);
                    setInterpretation(null);
                    setValidationResult(null);
                  }}
                  className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${category === "momentum" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                >
                  Momentum
                </button>
                <button
                  onClick={() => {
                    setCategory("thermodynamics");
                    setSelectedEquationId("pv1");
                    setSolution(null);
                    setInterpretation(null);
                    setValidationResult(null);
                  }}
                  className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${category === "thermodynamics" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                >
                  Thermo
                </button>
                <button
                  onClick={() => {
                    setCategory("rotational");
                    setSelectedEquationId("rot_tau1");
                    setSolution(null);
                    setInterpretation(null);
                    setValidationResult(null);
                  }}
                  className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${category === "rotational" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                >
                  Rotational
                </button>
                <button
                  onClick={() => {
                    setCategory("waves");
                    setSelectedEquationId("wave_v1");
                    setSolution(null);
                    setInterpretation(null);
                    setValidationResult(null);
                  }}
                  className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${category === "waves" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                >
                  Waves
                </button>
                <button
                  onClick={() => {
                    setCategory("advanced");
                    setSelectedEquationId("lag_1");
                    setSolution(null);
                    setInterpretation(null);
                    setValidationResult(null);
                  }}
                  className={`py-1.5 px-3 rounded-md text-sm font-medium transition-all ${category === "advanced" ? "bg-background shadow-sm" : "text-muted-foreground"
                    }`}
                >
                  Advanced
                </button>
              </div>

              <EquationSelector
                category={category}
                selectedId={selectedEquationId}
                onSelect={handleEquationSelect}
              />

              <ConstantsLibrary />
            </div>
            <div className="lg:col-span-8 flex flex-col gap-8">
              {validationResult && !validationResult.isValid && (
                <ValidationAlert
                  validation={validationResult}
                  onDismiss={() => setValidationResult(null)}
                  onFixManually={() => {
                    setValidationResult(null);
                    setActiveTab("form");
                  }}
                />
              )}
              <DynamicForm
                equationId={selectedEquationId}
                onSubmit={handleSolve}
                initialValues={interpretation}
              />
              {solution && (
                <SolutionDisplay
                  result={solution.result}
                  solveFor={solution.solveFor}
                  steps={solution.steps}
                  inputValues={solution.inputValues}
                  category={solution.category}
                  equationId={solution.equationId}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12">
              <NaturalLanguageInput onParse={handleAIParse} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
