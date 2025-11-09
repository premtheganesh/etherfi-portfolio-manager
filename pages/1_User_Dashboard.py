import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

from utils import load_store, save_store, anon_hash, new_rec_id
from backend import fetch_etherfi, fetch_eth_price_usd, generate_two_portfolios, llm_summary, reward_split

st.title("👤 User Dashboard")
st.caption("Anonymous profile → two portfolios → broker votes → you decide. Educational demo only.")

store = load_store()

with st.container(border=True):
    st.subheader("Your anonymized profile")
    col1, col2, col3 = st.columns(3)
    with col1:
        nickname = st.text_input("Nickname (for anonymous ID only)", value="guest")
    with col2:
        eth_holdings = st.number_input("Your ETH holdings", min_value=0.0, value=5.0, step=0.1)
    with col3:
        risk = st.selectbox("Risk preference", ["low", "medium", "high"], index=1)
    goal = st.text_input("Goal (e.g., steady yield)", value="steady yield")
    user_hash = anon_hash(nickname.strip() or "guest")
    st.info(f"Anonymous ID: `{user_hash}`")

# Market metrics
etherfi = fetch_etherfi()
eth_usd = fetch_eth_price_usd()
m1, m2, m3 = st.columns(3)
m1.metric("EtherFi APY", f"{etherfi['apy']}%")
m2.metric("EtherFi TVL", f"{etherfi['tvl_b']} B USD")
m3.metric("ETH Price", f"${eth_usd:,.2f}")

with st.container(border=True):
    st.subheader("Two portfolio recommendations")
    profile = {"eth_holdings": eth_holdings, "risk": risk, "goal": goal}
    market = {"apy": etherfi["apy"], "tvl_b": etherfi["tvl_b"], "eth_usd": eth_usd}
    portfolios = generate_two_portfolios(profile, market)
    summary = llm_summary(profile, market, portfolios)
    st.write(summary)

    # Display A & B with pie charts
    for name, alloc in portfolios.items():
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

    if st.button("Create recommendation for broker voting"):
        rec_id = new_rec_id()
        store["users"][user_hash] = profile
        store["recs"][rec_id] = {"user_hash": user_hash, "input": {"profile": profile, "market": market}, "portfolios": portfolios, "summary": summary}
        store["votes"][rec_id] = {}
        save_store(store)
        st.session_state["current_rec"] = rec_id
        st.success(f"Recommendation created. Share ID with broker: **{rec_id}**")

rec_id = st.session_state.get("current_rec")
if rec_id and rec_id in store["recs"]:
    st.markdown("---")
    st.subheader("⏱️ Set your time limit (mandatory)")
    tl = st.number_input("Time limit (days)", min_value=1, max_value=365, value=30, step=1)

    st.subheader("📊 Broker votes")
    votes = store["votes"].get(rec_id, {})
    if votes:
        for k, v in votes.items():
            st.write(f"- {k}: **{v}** vote(s)")
    else:
        st.info("No votes yet. Ask broker to open the Broker Dashboard.")

    st.subheader("✅ Your decision")
    options = list(store["recs"][rec_id]["portfolios"].keys())
    decision = st.selectbox("Choose a portfolio", ["No action"] + options)
    est_reward = st.number_input("Simulated total reward (USD) for payout split", min_value=0.0, value=100.0, step=10.0)
    if st.button("Confirm decision"):
        store["decisions"][rec_id] = {"decision": decision, "time_limit_days": int(tl)}
        save_store(store)
        st.success("Decision saved. Reward split (simulated):")
        split = reward_split(est_reward)
        st.write(f"User: ${split['user']}  |  Broker: ${split['broker']}  |  Platform: ${split['platform']}")

    st.subheader("🗣️ Feedback to LLM")
    colA, colB = st.columns(2)
    with colA:
        thumb = st.selectbox("Thumb", ["👍", "👎"])
    with colB:
        note = st.text_input("Note (optional)", "")
    if st.button("Submit feedback"):
        store["feedback"].setdefault(rec_id, [])
        store["feedback"][rec_id].append({"thumb": thumb, "note": note})
        save_store(store)
        st.toast("Thanks for your feedback!", icon="✅")
