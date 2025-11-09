import os, requests, json
from typing import Dict, Any
from dotenv import load_dotenv
import anthropic

load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

def fetch_etherfi() -> Dict[str, float]:
    url = "https://api.llama.fi/protocol/etherfi"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        apy = float(data.get("apy"))
        tvl_usd = float(data.get("tvlUsd"))
        return {"apy": apy, "tvl_b": round(tvl_usd/1e9, 2)}
    except Exception:
        return {"apy": 4.5, "tvl_b": 2.70}

def fetch_eth_price_usd() -> float:
    url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        return float(data["ethereum"]["usd"])
    except Exception:
        return 3000.0

def generate_two_portfolios(profile: Dict[str, Any], market: Dict[str, Any]) -> Dict[str, Any]:
    risk = profile.get("risk", "medium")
    eth_holdings = profile.get("eth_holdings", 5.0)
    goal = profile.get("goal", "steady yield")
    portfolio_type = profile.get("portfolio_type", "etherfi-native")
    apy = market.get("apy", 4.5)
    tvl = market.get("tvl_b", 2.7)
    eth_usd = market.get("eth_usd", 3000.0)
    
    # Fallback portfolios if API fails
    fallback_portfolios = _get_fallback_portfolios(risk, portfolio_type)
    
    if not ANTHROPIC_API_KEY:
        print("No Anthropic API key, using fallback portfolios")
        return fallback_portfolios
    
    try:
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        
        # Generate different prompts based on portfolio type
        if portfolio_type == "traditional":
            prompt = f"""You are a DeFi portfolio advisor. Generate TWO distinct portfolio allocation strategies for an investor using TRADITIONAL asset classes.

**Investor Profile:**
- Risk Tolerance: {risk}
- Current Holdings: {eth_holdings} ETH (${eth_usd * eth_holdings:,.2f} USD)
- eETH Holdings: {profile.get('eeth_holdings', eth_holdings * 0.99):.4f} eETH (converted for ether.fi)
- Goal: {goal}

**Market Conditions:**
- EtherFi APY: {apy}%
- ETH Price: ${eth_usd}

**Asset Classes Available:**
1. eETH - Base ether.fi staked ETH (~{apy}% APY)
2. BTC/Alts - Bitcoin and alternative cryptocurrencies (15-20% estimated return, high volatility)
3. US Stocks - Traditional equity exposure (8-10% historical average)
4. Cash/FD - Safe fixed deposits and stable assets (3-4% return, very low risk)

**Task:**
Generate two traditional portfolios with simple asset allocation:
- Portfolio A: More crypto-focused (Crypto Tilt)
- Portfolio B: More balanced traditional approach (Balanced Traditional)

**Requirements:**
- Use ONLY these 4 asset classes: eETH, BTC/Alts, US Stocks, Cash/FD
- Allocations must sum to exactly 100%
- Consider the risk tolerance: {risk}
- For LOW risk: prioritize Cash/FD and US Stocks (50-70%), minimal BTC/Alts (0-10%)
- For MEDIUM risk: balanced mix across all 4 assets
- For HIGH risk: prioritize eETH and BTC/Alts (60-80%), minimal Cash/FD

**Output Format (IMPORTANT - respond ONLY with valid JSON):**
{{
  "Portfolio A — Crypto Tilt": {{
    "eETH": <number>,
    "BTC/Alts": <number>,
    "US Stocks": <number>,
    "Cash/FD": <number>
  }},
  "Portfolio B — Balanced Traditional": {{
    "eETH": <number>,
    "BTC/Alts": <number>,
    "US Stocks": <number>,
    "Cash/FD": <number>
  }}
}}

Generate the JSON now:"""
        else:  # etherfi-native
            prompt = f"""You are a DeFi portfolio advisor. Generate TWO distinct portfolio allocation strategies for an investor using ether.fi NATIVE protocols.

**Investor Profile:**
- Risk Tolerance: {risk}
- Current Holdings: {eth_holdings} ETH (${eth_usd * eth_holdings:,.2f} USD)
- eETH Holdings: {profile.get('eeth_holdings', eth_holdings * 0.99):.4f} eETH (converted for ether.fi)
- Goal: {goal}

**Market Conditions:**
- EtherFi APY: {apy}%
- EtherFi TVL: ${tvl}B USD
- ETH Price: ${eth_usd}

**ether.fi Protocol Strategies Available:**
1. weETH Staking (Value-accruing restaked ETH - base staking rewards)
2. Liquid Vaults (Automated DeFi strategies with auto-compounding)
3. Aave Integration (Lending/borrowing with weETH, ${'{'}5B+ TVL{'}'})
4. Pendle Integration (Fixed yield strategies, ${'{'}10M+ TVL{'}'})
5. Gearbox Integration (Leveraged farming, ${'{'}2M+ TVL{'}'})
6. ether.fi Cash (3% cashback on card purchases)

**Additional Asset Classes:**
7. eBTC (Restaked Bitcoin for additional rewards)
8. eUSD Stablecoins (Value-accruing restaked stables)
9. US Stocks (Traditional equity exposure)

**Task:**
Generate two portfolios using ether.fi protocols and asset classes:
- Portfolio A: More aggressive DeFi-focused (ether.fi Native)
- Portfolio B: More conservative balanced approach (Balanced Yield)

**Requirements:**
- Each portfolio must allocate across AT LEAST 5 different strategies
- Allocations must sum to exactly 100%
- Consider the risk tolerance: {risk}
- For LOW risk: prioritize weETH Staking, Aave, and Stablecoins
- For MEDIUM risk: balanced mix of staking, vaults, and integrations
- For HIGH risk: prioritize Liquid Vaults, Leveraged strategies, and eBTC
- Portfolio A should emphasize ether.fi native protocols
- Portfolio B should include more traditional assets for stability

**Output Format (IMPORTANT - respond ONLY with valid JSON):**
{{
  "Portfolio A — ether.fi Native": {{
    "weETH Staking": <number>,
    "Liquid Vaults": <number>,
    "Aave Integration": <number>,
    "Pendle Integration": <number>,
    "Gearbox Integration": <number>,
    "eBTC": <number>,
    "eUSD Stablecoins": <number>
  }},
  "Portfolio B — Balanced Yield": {{
    "weETH Staking": <number>,
    "Liquid Vaults": <number>,
    "Aave Integration": <number>,
    "eUSD Stablecoins": <number>,
    "US Stocks": <number>,
    "ether.fi Cash": <number>
  }}
}}

Generate the JSON now:"""

        # Try newer models first
        models_to_try = [
            "claude-sonnet-4-20250514",
            "claude-3-5-sonnet-20241022",
            "claude-3-opus-20240229"
        ]
        
        for model in models_to_try:
            try:
                response = client.messages.create(
                    model=model,
                    max_tokens=1000,
                    temperature=0.7,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                response_text = getattr(response.content[0], "text", str(response.content))
                print(f"Claude response (model: {model}):", response_text[:200])
                
                # Parse JSON from response
                portfolios = _parse_portfolio_json(response_text)
                
                if portfolios:
                    print(f"Successfully generated portfolios using {model}")
                    return portfolios
                    
            except Exception as e:
                if "not_found_error" in str(e) or "404" in str(e):
                    continue  # Try next model
                else:
                    print(f"Error with model {model}: {e}")
                    continue
        
        # If all models fail, use fallback
        print("All Claude models failed, using fallback portfolios")
        return fallback_portfolios
        
    except Exception as e:
        print(f"Error generating portfolios with AI: {e}")
        return fallback_portfolios

def _parse_portfolio_json(response_text: str) -> Dict[str, Any]:
    """Parse portfolio JSON from Claude response, handling markdown code blocks"""
    try:
        # Remove markdown code blocks if present
        text = response_text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        # Parse JSON
        portfolios = json.loads(text)
        
        # Validate structure
        if not isinstance(portfolios, dict):
            return None
            
        # Check that we have two portfolios
        if len(portfolios) != 2:
            return None
        
        # Validate each portfolio
        for name, allocation in portfolios.items():
            if not isinstance(allocation, dict):
                return None
            
            # Check that we have at least some assets
            if len(allocation) < 3:
                return None
            
            # Check that allocations are numbers and sum to ~100
            total = sum(allocation.values())
            if not (95 <= total <= 105):  # Allow small rounding errors
                # Normalize to 100
                factor = 100.0 / total
                for asset in allocation:
                    allocation[asset] = round(allocation[asset] * factor)
        
        return portfolios
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return None
    except Exception as e:
        print(f"Error parsing portfolio JSON: {e}")
        return None

def _get_fallback_portfolios(risk: str, portfolio_type: str = "etherfi-native") -> Dict[str, Any]:
    """Fallback portfolios if AI generation fails"""
    
    if portfolio_type == "traditional":
        # Traditional portfolios with simple asset classes
        if risk == "low":
            crypto_tilt = {"eETH": 20, "BTC/Alts": 10, "US Stocks": 40, "Cash/FD": 30}
            balanced = {"eETH": 15, "BTC/Alts": 5, "US Stocks": 45, "Cash/FD": 35}
        elif risk == "high":
            crypto_tilt = {"eETH": 40, "BTC/Alts": 30, "US Stocks": 20, "Cash/FD": 10}
            balanced = {"eETH": 35, "BTC/Alts": 25, "US Stocks": 30, "Cash/FD": 10}
        else:  # medium
            crypto_tilt = {"eETH": 30, "BTC/Alts": 20, "US Stocks": 30, "Cash/FD": 20}
            balanced = {"eETH": 25, "BTC/Alts": 15, "US Stocks": 35, "Cash/FD": 25}
        
        return {
            "Portfolio A — Crypto Tilt": crypto_tilt,
            "Portfolio B — Balanced Traditional": balanced
        }
    else:
        # ether.fi Native portfolios with protocols
        if risk == "low":
            etherfi_native = {
                "weETH Staking": 35,
                "Liquid Vaults": 10,
                "Aave Integration": 20,
                "Pendle Integration": 0,
                "Gearbox Integration": 0,
                "eBTC": 5,
                "eUSD Stablecoins": 30
            }
            balanced = {
                "weETH Staking": 25,
                "Liquid Vaults": 5,
                "Aave Integration": 15,
                "eUSD Stablecoins": 35,
                "US Stocks": 15,
                "ether.fi Cash": 5
            }
        elif risk == "high":
            etherfi_native = {
                "weETH Staking": 25,
                "Liquid Vaults": 30,
                "Aave Integration": 15,
                "Pendle Integration": 10,
                "Gearbox Integration": 10,
                "eBTC": 10,
                "eUSD Stablecoins": 0
            }
            balanced = {
                "weETH Staking": 30,
                "Liquid Vaults": 25,
                "Aave Integration": 15,
                "eUSD Stablecoins": 10,
                "US Stocks": 15,
                "ether.fi Cash": 5
            }
        else:  # medium
            etherfi_native = {
                "weETH Staking": 30,
                "Liquid Vaults": 20,
                "Aave Integration": 15,
                "Pendle Integration": 10,
                "Gearbox Integration": 5,
                "eBTC": 10,
                "eUSD Stablecoins": 10
            }
            balanced = {
                "weETH Staking": 25,
                "Liquid Vaults": 15,
                "Aave Integration": 20,
                "eUSD Stablecoins": 20,
                "US Stocks": 15,
                "ether.fi Cash": 5
            }
        
    return {
            "Portfolio A — ether.fi Native": etherfi_native,
            "Portfolio B — Balanced Yield": balanced
    }

def llm_summary(profile: Dict[str, Any], market: Dict[str, Any], portfolios: Dict[str, Any]) -> str:
    apy = market.get("apy"); tvl = market.get("tvl_b"); eth = market.get("eth_usd")
    text = (
        f"For a {profile.get('risk')} risk user holding {profile.get('eth_holdings')} ETH at ${eth:,.2f}, "
        f"EtherFi APY is {apy}% and TVL is {tvl}B. Two illustrative portfolios: "
        "A (Crypto Tilt) favors eETH and BTC/Alts; B (Conservative Income) favors Cash/FD and US Stocks. "
        "Educational guidance only — not financial advice."
    )
    if not ANTHROPIC_API_KEY:
        return text
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    prompt = f"""
You are a cautious DeFi/finance explainer. Summarize the two portfolios (A and B) below for a beginner.
Avoid advice; be educational and concise (<=100 words).

User: {profile}
Market: EtherFi APY {apy}%, TVL {tvl}B, ETH ${eth}
Portfolios: {portfolios}
"""
    # Try newer model first, fallback to older models if needed
    models_to_try = [
        "claude-sonnet-4-20250514",
        "claude-3-5-sonnet-20241022",
        "claude-3-opus-20240229",
        "claude-3-haiku-20240307"
    ]
    for model in models_to_try:
        try:
            resp = client.messages.create(
                model=model,
                max_tokens=300,
                temperature=0.3,
                messages=[{"role":"user","content":prompt}],
            )
            return getattr(resp.content[0], "text", str(resp.content))
        except Exception as e:
            if "not_found_error" in str(e) or "404" in str(e):
                continue  # Try next model
            else:
                # Other error (auth, rate limit, etc.) - return default text
                return text
    # If all models fail, return default text
    return text

def reward_split(total_reward: float) -> Dict[str, float]:
    """
    Calculate reward split between user, broker, and platform.
    Returns actual dollar amounts based on profit.
    """
    # Convert to float to handle string inputs
    total_reward = float(total_reward)
    
    user = round(total_reward * 0.96, 2)
    broker = round(total_reward * 0.03, 2)
    platform = round(total_reward * 0.01, 2)
    diff = round(total_reward - (user+broker+platform), 2)
    platform += diff
    return {
        "user": user, 
        "broker": broker, 
        "platform": platform,
        "total": total_reward
    }

def calculate_profit(eth_holdings: float, eth_price: float, expected_return_pct: float, 
                     time_limit_days: int) -> Dict[str, Any]:
    """
    Calculate profit based on investment and expected return.
    
    Args:
        eth_holdings: Amount of ETH user holds
        eth_price: Current ETH price in USD
        expected_return_pct: Expected annual return percentage
        time_limit_days: Time period in days
    
    Returns:
        Dictionary with investment, profit, and final value
    """
    # Convert to proper types to handle string inputs
    try:
        eth_holdings = float(eth_holdings)
        eth_price = float(eth_price)
        expected_return_pct = float(expected_return_pct)
        time_limit_days = int(time_limit_days)
    except (ValueError, TypeError) as e:
        print(f"Error converting profit calculation parameters: {e}")
        print(f"  eth_holdings: {eth_holdings} (type: {type(eth_holdings)})")
        print(f"  eth_price: {eth_price} (type: {type(eth_price)})")
        print(f"  expected_return_pct: {expected_return_pct} (type: {type(expected_return_pct)})")
        print(f"  time_limit_days: {time_limit_days} (type: {type(time_limit_days)})")
        raise
    
    initial_investment = round(eth_holdings * eth_price, 2)
    
    # Calculate profit based on expected return and time period
    annual_return = expected_return_pct / 100.0
    time_fraction = time_limit_days / 365.0
    profit = round(initial_investment * annual_return * time_fraction, 2)
    final_value = round(initial_investment + profit, 2)
    
    return {
        "initial_investment": initial_investment,
        "profit": profit,
        "final_value": final_value,
        "expected_return_pct": expected_return_pct,
        "time_period_days": time_limit_days
    }
