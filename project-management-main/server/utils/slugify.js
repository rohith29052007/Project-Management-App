/**
 * Convert string to URL-friendly slug
 */
export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with hyphens
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
        .replace(/^-+/, '')             // Trim hyphens from start
        .replace(/-+$/, '');            // Trim hyphens from end
};

/**
 * Generate unique slug by appending number if needed
 */
export const generateUniqueSlug = async (prisma, baseSlug, model = 'workspace', existingId = null) => {
    let slug = slugify(baseSlug);
    let counter = 1;
    let isUnique = false;
    
    while (!isUnique) {
        const where = { slug };
        if (existingId) {
            where.id = { not: existingId };
        }
        
        const existing = await prisma[model].findFirst({ where });
        
        if (!existing) {
            isUnique = true;
        } else {
            slug = `${slugify(baseSlug)}-${counter}`;
            counter++;
        }
    }
    
    return slug;
};

