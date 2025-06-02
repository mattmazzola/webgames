import json
import os
import sys
from pathlib import Path

import streamlit as st


def load_jsonl(file_path):
    """Load jsonl file line by line."""
    data = []
    with open(file_path, "r") as f:
        for line in f:
            data.append(json.loads(line))
    return data


def main():
    st.set_page_config(
        page_title="LadyBird Dataset Visualizer",
        layout="wide",
    )

    # Initialize session state variables if they don't exist
    if "current_index" not in st.session_state:
        st.session_state.current_index = 0
    
    if "displayed_image" not in st.session_state:
        st.session_state.displayed_image = None

    # Use first command line argument as dataset path if provided
    default_dataset_path = "../datasets/ladybird/ladybird_20250529T230516/dataset.jsonl"
    if len(sys.argv) > 1:
        default_dataset_path = sys.argv[1]

    # Input for dataset path
    dataset_path_str = st.text_input(
        "Path to dataset (.jsonl):",
        value=default_dataset_path,
    )

    if not dataset_path_str or not os.path.exists(dataset_path_str):
        st.error("File does not exist. Please check the path.")
        st.stop()
    elif not dataset_path_str.endswith(".jsonl"):
        st.error("File is not a .jsonl file.")
        st.stop()

    if (
        "dataset_path_str" not in st.session_state
        or st.session_state.dataset_path_str != dataset_path_str
    ):
        try:
            dataset = load_jsonl(dataset_path_str)
        except json.JSONDecodeError:
            st.error(
                "Error parsing the JSONL file. Make sure it contains valid JSON lines."
            )
            st.stop()
        except Exception as e:
            st.error(f"Error loading dataset: {str(e)}")
            st.stop()

        st.session_state.dataset_items = dataset
        st.session_state.dataset_path_str = dataset_path_str
        st.session_state.index = 0
        
        # Initialize with the first image if dataset loaded successfully
        if dataset and len(dataset) > 0 and "images" in dataset[0] and len(dataset[0]["images"]) > 0:
            dataset_dir = Path(dataset_path_str).parent
            st.session_state.displayed_image = dataset_dir / dataset[0]["images"][0]

    items = st.session_state.dataset_items
    num_items = len(items)

    # Functions to handle navigation
    def go_previous():
        st.session_state.current_index = max(0, st.session_state.current_index - 1)

    def go_next():
        st.session_state.current_index = min(
            num_items - 1, st.session_state.current_index + 1
        )

    def jump_to_line():
        # Convert from 1-based (UI) to 0-based (internal)
        st.session_state.current_index = st.session_state.jump_input - 1

    # Controls for navigation
    col_prev, col_next, col_counter, col_goto = st.columns(4)

    # Previous and Next buttons adjacent to each other
    with col_prev:
        prev_disabled = st.session_state.current_index <= 0
        st.button("⬅️ Previous", on_click=go_previous, disabled=prev_disabled)

    with col_next:
        next_disabled = st.session_state.current_index >= num_items - 1
        st.button("Next ➡️", on_click=go_next, disabled=next_disabled)

    current_data = items[st.session_state.current_index]

    # Show entry number, total, and task index
    with col_counter:
        task_index = current_data.get("taskIndex", "N/A")
        st.write(f"Line {st.session_state.current_index + 1} of {num_items} (Task Index: {task_index})")

    # Jump to specific line with label on the left
    with col_goto:
        col_label, col_input = st.columns([1, 3])
        with col_label:
            st.write("Go to line:")
        with col_input:
            st.number_input(
                "Go to line:",
                min_value=1,
                max_value=num_items,
                value=st.session_state.current_index + 1,
                step=1,
                label_visibility="collapsed",
                key="jump_input",
                on_change=jump_to_line,
            )

    # Display image and data in two columns
    col_img, col_data = st.columns(2)

    with col_img:
        # Get dataset directory for resolving relative image paths
        dataset_dir = Path(st.session_state.dataset_path_str).parent

        # Prepare image paths and check existence
        image_paths = {}
        image_paths["initial"] = dataset_dir / current_data["images"][0]
        image_paths["sequence"] = dataset_dir / current_data["images"][1]
        image_paths["result"] = dataset_dir / current_data["images"][2]

        # Define functions to select which image to display
        def show_initial():
            st.session_state.displayed_image = image_paths["initial"]

        def show_sequence():
            st.session_state.displayed_image = image_paths["sequence"]

        def show_result():
            st.session_state.displayed_image = image_paths["result"]

        # Create thumbnail gallery
        preview_image_width = 140
        main_image_width = 500

        st.subheader("Thumbnails")
        cols = st.columns(3)

        with cols[0]:
            st.image(str(image_paths["initial"]), width=preview_image_width)
            st.button("initial", on_click=show_initial)

        with cols[1]:
            st.image(str(image_paths["sequence"]), width=preview_image_width)
            st.button("sequence", on_click=show_sequence)

        with cols[2]:
            st.image(str(image_paths["result"]), width=preview_image_width)
            st.button("result", on_click=show_result)

        if st.session_state.displayed_image is not None:
            st.image(
                st.session_state.displayed_image,
                caption=str(st.session_state.displayed_image.name),
                width=main_image_width,
            )

    with col_data:
        st.subheader("Data:")
        st.write(f"Password: {current_data['password']}")
        st.write(f"Actions: {len(current_data["actions"])}")

        st.subheader("Full JSON Data:")
        st.json(current_data)


if __name__ == "__main__":
    main()
