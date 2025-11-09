import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from utils import load_store, save_store

st.title("🧑‍💼 Broker Dashboard")
st.caption("Review anonymous profile & two portfolios, then vote. Educational only.")

store = load_store()

st.subheader("Open recommendations")
if not store["recs"]:
    st.info("No recommendations yet. Ask a user to create one from the User Dashboard.")
else:
    ids = list(sorted(store["recs"].keys(), reverse=True))
    rec_id = st.selectbox("Select recommendation ID", ids)
    rec = store["recs"][rec_id]
    st.markdown(f"**User (anonymous id):** `{rec['user_hash']}`")
    st.markdown("**User profile (anonymized):**")
    st.json(rec["input"]["profile"])
    st.markdown("**Market snapshot at creation:**")
    st.json(rec["input"]["market"])
    st.markdown("**LLM summary:**")
    st.write(rec.get("summary",""))

    st.markdown("### Portfolios")
    for name, alloc in rec["portfolios"].items():
        st.markdown(f"**{name}**")
        df = pd.DataFrame({"Asset": list(alloc.keys()), "Weight %": list(alloc.values())})
        c1, c2 = st.columns([1,1])
        with c1:
            fig, ax = plt.subplots()
            ax.pie(df["Weight %"], labels=df["Asset"], autopct="%1.0f%%", startangle=90)
            ax.axis("equal")
            st.pyplot(fig)
        with c2:
            st.dataframe(df, hide_index=True, use_container_width=True)

    st.markdown("### Cast your vote")
    choice = st.selectbox("Vote for one", list(rec["portfolios"].keys()))
    if st.button("Submit vote"):
        store["votes"].setdefault(rec_id, {})
        store["votes"][rec_id][choice] = store["votes"][rec_id].get(choice, 0) + 1
        save_store(store)
        st.success("Vote recorded ✅")

    st.markdown("---")
    st.subheader("User decision & time limit")
    decision = store["decisions"].get(rec_id)
    if decision:
        st.write(f"Decision: **{decision['decision']}**; Time limit: **{decision['time_limit_days']} days**")
    else:
        st.info("User has not decided yet.")
