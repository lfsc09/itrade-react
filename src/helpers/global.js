const generateHash = (len) => {
    return Math.random().toString(16).substr(2, len);
};

export { generateHash };
