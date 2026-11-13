import pathlib
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Pixel Quest: The Lost Kingdom", layout="wide")
html = pathlib.Path(__file__).with_name("index.html").read_text(encoding="utf-8")
components.html(html, height=760, scrolling=False)
