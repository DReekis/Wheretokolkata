export function calculateScore(upvotes: number, downvotes: number): number {
    const total = upvotes + downvotes;
    if (total === 0) return 0;
    return Math.round((upvotes / total) * 100) / 100;
}

export function isHiddenGem(score: number, upvotes: number, downvotes: number): boolean {
    const totalVotes = upvotes + downvotes;
    return score >= 0.8 && totalVotes > 0 && totalVotes <= 10;
}

export function isControversial(upvotes: number, downvotes: number): boolean {
    return upvotes >= 5 && downvotes >= 5;
}

export function calculateKarma(placesCount: number, totalUpvotesReceived: number): number {
    return placesCount + totalUpvotesReceived;
}

export function getScoreLabel(score: number): string {
    if (score >= 0.9) return "Highly Recommended";
    if (score >= 0.7) return "Recommended";
    if (score >= 0.5) return "Mixed";
    if (score > 0) return "Not Recommended";
    return "No votes yet";
}

export function getScorePercentage(score: number): number {
    return Math.round(score * 100);
}
