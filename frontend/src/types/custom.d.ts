// Type declarations for custom components
declare module '@/components/HeroSection' {
    const HeroSection: React.FC;
    export default HeroSection;
}

declare module '@/components/MatchScroller' {
    const MatchScroller: React.FC;
    export default MatchScroller;
}

declare module '@/components/MatchCard' {
    interface MatchCardProps {
        match: {
            id: string;
            match: string;
            league: string;
        };
        onClick: () => void;
    }
    const MatchCard: React.FC<MatchCardProps>;
    export default MatchCard;
}

declare module '@/components/ReasoningModal' {
    interface ReasoningModalProps {
        isOpen: boolean;
        reasoning: string;
        onClose: () => void;
    }
    const ReasoningModal: React.FC<ReasoningModalProps>;
    export default ReasoningModal;
} 