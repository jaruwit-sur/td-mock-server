import st from 'stjs';

export const transform = async (data, template) => {
    return await st.select(template)
        .transform(data)
        .root();
}