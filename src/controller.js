export default (error, res, done) => {
    if (error) {
        return console.error(error);
    }

    const $ = res.$;
    console.log($('.entry-content').html());
    done();
};
