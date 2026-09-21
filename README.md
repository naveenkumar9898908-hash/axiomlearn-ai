# AxiomLearn AI — Adaptive Knowledge Tracing & Prerequisite Graph Engine
### TENSORA 2026 Hackathon • Problem Statement [EDU-01]: Uniform Pacing and Unidentified Knowledge Gaps

> **Track**: Education  
> **Problem Statement**: Every student understands topics at a different pace, yet standard instruction treats the entire class as a single unit. Learners frequently struggle with specific foundational concepts without realizing where their confusion began. Without individual tracking, struggling students fall further behind as tests fail to adapt to their exact weak points.

---

## 🌟 Solution Overview

**AxiomLearn AI** is a real-time adaptive learning engine that pinpoints precisely which prerequisite foundational misconception is tripping up a student and generates customized micro-practice paths.

It addresses all AI requirements specified in [EDU-01]:
1. **Bayesian Knowledge Tracing (BKT)** with Corbett-Anderson posterior updates and latency-aware slip/guess modulation.
2. **Deep Knowledge Tracing (DKT)** recurrent neural network (GRU cognitive dynamics) predicting multi-concept mastery transfer simultaneously.
3. **Prerequisite Knowledge Graph Network (DAG)** mapping relationships, dependency weights, depth levels, and misconception propagation across syllabus concepts.
4. **Dynamic Question Difficulty Selector (2PL IRT & ZPD)** adapting question difficulty in real time to match the student's Zone of Proximal Development (~70-75% flow state challenge).
5. **Root-Cause Misconception Diagnostic Algorithm** using backward DAG traversal to isolate foundational bottlenecks from distractor error signatures.
6. **Customized 4-Step Micro-Practice Paths**: Refresher $\to$ Foundational Check $\to$ Scaffolded Bridge $\to$ Mastery Verification.

---

## 📐 Mathematical Foundations

### 1. Bayesian Knowledge Tracing (BKT)
Based on Corbett & Anderson (1995), parameterized by four probabilities per concept:
- $P(L_0)$: Initial prior mastery probability
- $P(T)$: Learning transition probability per practice opportunity
- $P(G)$: Guess probability (correct answer without mastery)
- $P(S)$: Slip probability (incorrect answer despite mastery)

#### Bayesian Posterior Update:
$$P(L_t \mid \text{correct}) = \frac{P(L_t) \cdot (1 - P(S))}{P(L_t) \cdot (1 - P(S)) + (1 - P(L_t)) \cdot P(G)}$$

$$P(L_t \mid \text{incorrect}) = \frac{P(L_t) \cdot P(S)}{P(L_t) \cdot P(S) + (1 - P(L_t)) \cdot (1 - P(G))}$$

#### Next Opportunity Transition:
$$P(L_{t+1}) = P(L_t \mid \text{obs}) + (1 - P(L_t \mid \text{obs})) \cdot P(T) \cdot \lambda_{\text{latency}}$$

*Latency-Aware Modulation $\lambda_{\text{latency}}$*: Rapid incorrect answers ($< 3\text{s}$) are treated with increased slip probability (hurry/careless), dampening harsh mastery drops; slow incorrect answers ($> 30\text{s}$) indicate confirmed cognitive struggle and trigger the root-cause diagnostic.

---

### 2. Deep Knowledge Tracing (DKT)
Based on Piech et al. (Stanford University, NeurIPS 2015):
- Encodes interactions $(q_t, a_t)$ into dense input vectors $\mathbf{x}_t \in \mathbb{R}^{2M}$.
- Maintains a continuous recurrent cognitive state $\mathbf{h}_t \in \mathbb{R}^{32}$ via Gated Recurrent Unit (GRU) cells:
  $$\mathbf{z}_t = \sigma(\mathbf{W}_z \mathbf{x}_t + \mathbf{U}_z \mathbf{h}_{t-1} + \mathbf{b}_z)$$
  $$\mathbf{r}_t = \sigma(\mathbf{W}_r \mathbf{x}_t + \mathbf{U}_r \mathbf{h}_{t-1} + \mathbf{b}_r)$$
  $$\tilde{\mathbf{h}}_t = \tanh(\mathbf{W}_h \mathbf{x}_t + \mathbf{U}_h (\mathbf{r}_t \odot \mathbf{h}_{t-1}) + \mathbf{b}_h)$$
  $$\mathbf{h}_t = (1 - \mathbf{z}_t) \odot \mathbf{h}_{t-1} + \mathbf{z}_t \odot \tilde{\mathbf{h}}_t$$
- Outputs simultaneous mastery predictions across all $M$ syllabus concepts:
  $$\hat{\mathbf{y}}_t = \sigma(\mathbf{W}_{\text{out}} \mathbf{h}_t + \mathbf{b}_{\text{out}}) \in (0, 1)^M$$

---

### 3. Dynamic Question Difficulty Selector (2-Parameter Logistic IRT)
Item Response Theory model estimating probability of a correct response:
$$P(\text{correct} \mid \theta, a, b) = \frac{1}{1 + e^{-a(\theta - b)}}$$
where $\theta$ is student latent ability, $b$ is question difficulty, and $a$ is question discrimination.

**Zone of Proximal Development (ZPD) Targeting**: The engine selects questions with predicted success $P^* \approx 0.72$, maximizing retention and preventing boredom or discouragement.

---

### 4. Backward DAG Traversal & Misconception Root-Cause Diagnostic
When a student makes an error on concept $C$:
1. The engine inspects the chosen option: distractor answers map directly to documented cognitive misconceptions (e.g. *The Freshman's Dream: $(a+b)^2 = a^2+b^2$* or *Local BST verification flaw*).
2. Traverses backward through the prerequisite DAG, evaluating ancestral deficit risk:
   $$\text{Risk}(A) = (1 - P(L_A)) \times w_{A \to C} \times \left(1 + \frac{1}{1 + \text{depth}}\right)$$
3. Isolates the root bottleneck and automatically compiles a **4-Step Micro-Practice Path**:
   - **Step 1: Cognitive Refresher Card** (Visual model + golden mnemonic + trap warning)
   - **Step 2: Foundational Check** (Direct test of root prerequisite)
   - **Step 3: Scaffolded Bridge** (Intermediate connecting question)
   - **Step 4: Target Mastery Verification** (Re-testing target concept to verify resolution)

---

## 🚀 Quick Start & Running Locally

### Prerequisites
- Node.js (v18+) and npm

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Run automated AI verification test suite
npm test
# (or: npx tsx tests/engine.test.ts)

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🖥️ Interactive Dashboard Modules

1. **Syllabus Prerequisite DAG & Mastery Network**:
   - Visual topological DAG with color-coded mastery heat arcs.
   - Interactive nodes showing $P(L)$, depth levels, and prerequisite weights.
   - Live highlight of student's **Zone of Proximal Development Frontier**.
2. **Adaptive Practice Arena**:
   - Dynamic 2PL IRT difficulty selector serving real-time calibrated questions.
   - Latency timer tracking response deliberation.
   - Immediate feedback with misconception explanations and 1-click **"Pinpoint Root Cause Gap"**.
3. **Micro-Practice Runner**:
   - Guided 4-step remediation pathway with real-time progress and mastery gain feedback.
4. **AI Knowledge Tracing & Cognitive Telemetry**:
   - Side-by-side BKT parameters table ($P(L_0), P(T), P(G), P(S)$).
   - DKT GRU hidden neuron activations heatmap ($\mathbf{h}_t \in \mathbb{R}^{32}$) and multi-skill prediction vector $\hat{\mathbf{y}}_t$.
   - Interactive Item Characteristic Curves (ICC) with student ability $\theta$ and ZPD band.
5. **Class Cohort Pacing & Bottleneck Detector**:
   - Instructor view analyzing 20+ students across different personas (Fast Pacers, Steady, Prerequisite-Blocked, Struggling).
   - Instant identification of syllabus-wide bottlenecks (e.g., 58% class failure rate on Chain Rule caused by Exponent Laws).

---

## 📂 Project Structure

```
├── src/
│   ├── types/
│   │   └── index.ts                 # TypeScript types & interfaces
│   ├── engine/
│   │   ├── bkt.ts                   # Bayesian Knowledge Tracing engine
│   │   ├── dkt.ts                   # Deep Knowledge Tracing recurrent model
│   │   ├── knowledgeGraph.ts        # Prerequisite DAG & topological sort
│   │   ├── irtSelector.ts           # 2PL IRT dynamic difficulty selector
│   │   ├── diagnostic.ts            # Root-cause misconception diagnostic
│   │   └── microPractice.ts         # 4-step remediation path generator
│   ├── data/
│   │   ├── mathCurriculum.ts        # Calculus & Algebra syllabus DAG + questions
│   │   ├── csCurriculum.ts          # CS & Algorithms syllabus DAG + questions
│   │   └── curriculumData.ts        # Unified curriculum registry
│   ├── components/
│   │   ├── Navbar.tsx               # Top navigation & student stats capsule
│   │   ├── KnowledgeGraphView.tsx   # Interactive SVG concept network
│   │   ├── AdaptivePracticeArena.tsx# Real-time adaptive quiz arena
│   │   ├── MisconceptionDiagnosticModal.tsx # Root-cause diagnostic visualizer
│   │   ├── MicroPracticeRunner.tsx  # 4-step remediation journey
│   │   ├── ModelInspector.tsx       # BKT/DKT/IRT mathematical inspector
│   │   └── TeacherCohortDashboard.tsx # Class cohort analytics & bottlenecks
│   ├── App.tsx                      # Core state orchestration
│   ├── main.tsx                     # React root
│   └── index.css                    # Tailwind styles & SVG animation effects
├── tests/
│   └── engine.test.ts               # Verification test suite (5/5 tests)
├── package.json
└── vite.config.ts
```
