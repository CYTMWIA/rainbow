Module['onRuntimeInitialized'] = function () {
    let entry = Module.cwrap('frontend_entry', 'number', ['string']);
    if (typeof PAGE_JSON !== 'undefined') {
        // The variable `PAGE_JSON` is defined.
        entry(PAGE_JSON);
    } else {
        console.log('`PAGE_JSON` is not defined!');
    }
};
