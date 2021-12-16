const parseGroupsResponse = async (data) => {

    return data.map(group => {
        group.selected = true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { organization, scoped, groupid, links, ...rest } = group;
        return rest;
    });


}

export default parseGroupsResponse;