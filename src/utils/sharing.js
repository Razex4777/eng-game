export const handleShareChallenge = async (title, text) => {
    const url = window.location.origin;
    const shareData = {
        title: title,
        text: text,
        url: url,
    };

    // Try native share first
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return { type: 'share', success: true };
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing:', err);
            }
        }
    }

    // Fallback: Copy to clipboard
    try {
        const fullText = `${text}\n${url}`;
        await navigator.clipboard.writeText(fullText);
        return { type: 'copy', success: true };
    } catch (err) {
        console.error('Error copying to clipboard:', err);
        return { type: 'copy', success: false };
    }
};
