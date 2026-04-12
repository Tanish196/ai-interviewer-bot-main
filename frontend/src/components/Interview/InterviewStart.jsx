import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SetupSidebar from '../InterviewSetup/SetupSidebar';
import SetupHeader from '../InterviewSetup/SetupHeader';
import DomainGrid from '../InterviewSetup/DomainGrid';
import ConfigurationPanel from '../InterviewSetup/ConfigurationPanel';
import SessionInsightCard from '../InterviewSetup/SessionInsightCard';
import './Interview.css';

const DOMAIN_OPTIONS = [
    {
        value: 'DSA',
        label: 'DSA & Problem Solving',
        description: 'Algorithm optimization, complex data structures, and computational complexity analysis.',
        icon: 'code',
        iconColor: 'text-primary',
        tags: ['Recursion', 'Dynamic Programming', 'Graph Theory'],
        badge: 'Most Popular',
        large: true,
    },
    {
        value: 'System Design',
        label: 'System Design',
        description: 'Distributed systems, scalability, and high-availability architecture.',
        icon: 'account_tree',
        iconColor: 'text-secondary',
    },
    {
        value: 'HR',
        label: 'HR & Behavioral',
        description: 'Soft skills, leadership, and culture-fit distillation.',
        icon: 'psychology',
        iconColor: 'text-tertiary',
    },
    {
        value: 'Frontend',
        label: 'Frontend Eng',
        description: 'Performance, accessibility, and modern framework mastery.',
        icon: 'web',
        iconColor: 'text-primary-fixed-dim',
    },
    {
        value: 'Backend',
        label: 'Backend & API',
        description: 'Security, concurrency, and persistent storage strategies.',
        icon: 'database',
        iconColor: 'text-on-secondary-container',
    },
];

const DIFFICULTY_OPTIONS = [
    { value: 'junior', label: 'Junior', icon: 'speed' },
    { value: 'senior', label: 'Senior', icon: 'bolt' },
    { value: 'expert', label: 'Expert', icon: 'local_fire_department' },
];

const InterviewStart = () => {
    const [domain, setDomain] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(12);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSetupStart = () => {
        if (!numberOfQuestions || numberOfQuestions < 5) {
            alert('Please choose at least 5 questions.');
            return;
        }
        if (!domain) {
            alert('Please select an interview domain.');
            return;
        }
        if (!difficulty) {
            alert('Please select a difficulty level.');
            return;
        }

        setIsLoading(true);
        navigate('/progress', {
            state: {
                domain,
                difficulty,
                questionCount: numberOfQuestions,
                fromSetup: true,
            },
        });
    };

    return (
        <div className="relative min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
            <SetupSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="w-full min-h-screen md:pl-72">
                <SetupHeader onOpenSidebar={() => setSidebarOpen(true)} />
                <div className="w-full p-4 md:p-6 lg:p-10 xl:px-12">
                    <div className="mb-10 md:mb-12">
                        <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase block mb-2">
                            Phase 01 - Selection
                        </span>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight font-headline text-on-surface mb-4">
                            Choose Domain
                        </h3>
                        <p className="text-on-surface-variant max-w-2xl text-base md:text-lg">
                            Distill technical competence through AI-driven evaluation. Select a domain to begin the configuration.
                        </p>
                    </div>

                    <DomainGrid domains={DOMAIN_OPTIONS} selectedDomain={domain} onSelectDomain={setDomain} />

                    <section
                        id="phase-2"
                        className="scroll-mt-28 pt-2 md:pt-4 grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10"
                    >
                        <div className="lg:col-span-2 space-y-8 w-full">
                            <div className="mb-8">
                                <span className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase block mb-2">
                                    Phase 02 - Parameters
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold font-headline">Fine-tune the Alchemist</h3>
                            </div>
                            <ConfigurationPanel
                                questionCount={numberOfQuestions}
                                onQuestionCountChange={setNumberOfQuestions}
                                difficulty={difficulty}
                                onDifficultyChange={setDifficulty}
                                difficulties={DIFFICULTY_OPTIONS}
                            />
                        </div>
                        <div className="xl:sticky xl:top-28 h-fit">
                            <div className="w-full max-w-[380px]">
                                <SessionInsightCard
                                    disabled={!domain || !difficulty || !numberOfQuestions}
                                    loading={isLoading}
                                    onStart={handleSetupStart}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default InterviewStart;
