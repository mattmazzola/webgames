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
        page_title="Map Panner Dataset Visualizer",
        layout="wide",
    )
    
    # Add CSS for keyboard shortcut help
    st.markdown("""
        <style>
        .keyboard-shortcut {
            padding: 4px 8px;
            margin: 0 2px;
            background-color: #f1f1f1;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-family: monospace;
            display: inline-block;
        }
        </style>
    """, unsafe_allow_html=True)

    # Initialize session state variables if they don't exist
    if "current_index" not in st.session_state:
        st.session_state.current_index = 0
    
    if "displayed_image" not in st.session_state:
        st.session_state.displayed_image = None
    
    if "image_category" not in st.session_state:
        st.session_state.image_category = "initial"
        
    if "key_pressed" not in st.session_state:
        st.session_state.key_pressed = None
        
    if "show_shortcuts" not in st.session_state:
        st.session_state.show_shortcuts = False

    # Use first command line argument as dataset path if provided
    default_dataset_path = "../../datasets/map-panner/map-panner_20250529T194005/dataset.jsonl"
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
        st.session_state.current_index = 0
        
        # Initialize with the first image if dataset loaded successfully
        if dataset and len(dataset) > 0 and "images" in dataset[0] and len(dataset[0]["images"]) > 0:
            dataset_dir = Path(dataset_path_str).parent
            st.session_state.displayed_image = dataset_dir / dataset[0]["images"][0]

    items = st.session_state.dataset_items
    num_items = len(items)

    # Functions to handle navigation
    def go_previous():
        new_index = max(0, st.session_state.current_index - 1)
        st.session_state.current_index = new_index
        
        # Update displayed image to show the first image of the new item
        if items and len(items) > 0 and "images" in items[new_index] and len(items[new_index]["images"]) > 0:
            dataset_dir = Path(st.session_state.dataset_path_str).parent
            st.session_state.displayed_image = dataset_dir / items[new_index]["images"][0]
            st.session_state.image_category = "initial"

    def go_next():
        new_index = min(num_items - 1, st.session_state.current_index + 1)
        st.session_state.current_index = new_index
        
        # Update displayed image to show the first image of the new item
        if items and len(items) > 0 and "images" in items[new_index] and len(items[new_index]["images"]) > 0:
            dataset_dir = Path(st.session_state.dataset_path_str).parent
            st.session_state.displayed_image = dataset_dir / items[new_index]["images"][0]
            st.session_state.image_category = "initial"

    def jump_to_line():
        # Convert from 1-based (UI) to 0-based (internal)
        new_index = st.session_state.jump_input - 1
        st.session_state.current_index = new_index
        
        # Update displayed image to show the first image of the new item
        if items and len(items) > 0 and "images" in items[new_index] and len(items[new_index]["images"]) > 0:
            dataset_dir = Path(st.session_state.dataset_path_str).parent
            st.session_state.displayed_image = dataset_dir / items[new_index]["images"][0]
            st.session_state.image_category = "initial"

    # Controls for navigation
    col_prev, col_next, col_counter, col_goto = st.columns(4)

    # Previous and Next buttons adjacent to each other
    with col_prev:
        prev_disabled = st.session_state.current_index <= 0
        st.button("⬅️ Previous", key="prev_btn", on_click=go_previous, disabled=prev_disabled)

    with col_next:
        next_disabled = st.session_state.current_index >= num_items - 1
        st.button("Next ➡️", key="next_btn", on_click=go_next, disabled=next_disabled)

    # Show entry number and total
    with col_counter:
        st.write(f"Line {st.session_state.current_index + 1} of {num_items}")

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

    current_data = items[st.session_state.current_index]

    # Display image and data in two columns
    col_img, col_data = st.columns(2)

    with col_img:
        # Get dataset directory for resolving relative image paths
        dataset_dir = Path(st.session_state.dataset_path_str).parent
        
        # Categorize images for map-panner
        images = current_data["images"]
        image_categories = {}
        
        # Create image categories
        image_categories["initial"] = images[0] if images else None
        image_categories["found"] = images[-1] if len(images) >= 2 else None
        
        # Group pan operations and other intermediate steps
        pan_images = []
        for i, img_path in enumerate(images[1:-1], 1):  # Skip first (initial) and last (found) images
            # Check if it's a pan operation
            if "_pan_" in img_path.lower():
                pan_images.append(img_path)
        
        image_categories["pan_operations"] = pan_images
        
        # Define functions to select which image to display
        def show_image(category, index=None):
            if category == "pan_operations" and index is not None:
                if index < len(image_categories[category]):
                    img_path = image_categories[category][index]
                    st.session_state.displayed_image = dataset_dir / img_path
                    st.session_state.image_category = f"{category}_{index}"
            else:
                img_path = image_categories[category]
                if img_path:
                    st.session_state.displayed_image = dataset_dir / img_path
                    st.session_state.image_category = category

        # Create thumbnail gallery
        preview_image_width = 140
        
        st.subheader("Thumbnails")
        
        # Show initial image
        if image_categories["initial"]:
            col1, col2 = st.columns([1, 3])
            with col1:
                st.image(str(dataset_dir / image_categories["initial"]), width=preview_image_width)
            with col2:
                st.button("Initial State", on_click=show_image, args=("initial",))
                st.write("Starting position of map")
        
        # Show found (final) image
        if image_categories["found"]:
            col1, col2 = st.columns([1, 3])
            with col1:
                st.image(str(dataset_dir / image_categories["found"]), width=preview_image_width)
            with col2:
                st.button("Found Treasure", on_click=show_image, args=("found",))
                st.write("Final state with treasure found")
        
        # Show pan operations in expandable section
        if image_categories["pan_operations"]:
            num_operations = len(image_categories["pan_operations"])
            with st.expander(f"Pan Operations ({num_operations})", expanded=False):
                for i, img_path in enumerate(image_categories["pan_operations"]):
                    col1, col2 = st.columns([1, 3])
                    with col1:
                        st.image(str(dataset_dir / img_path), width=preview_image_width)
                    with col2:
                        step_name = img_path.split('_')[-2:]
                        step_desc = ' '.join(step_name).replace('.png', '')
                        st.button(f"Pan Step {i+1}: {step_desc}", key=f"pan_{i}", on_click=show_image, args=("pan_operations", i))
        
        # Show the currently selected image
        st.subheader("Selected Image")
        if st.session_state.displayed_image is not None:
            # Always show full width and filename
            st.image(
                str(st.session_state.displayed_image),
                caption=str(st.session_state.displayed_image.name),
                width=None,  # Full width
            )

    with col_data:
        st.subheader("Map Panner Data:")
        
        # Display target position with coordinates
        st.write("### Target Position")
        st.write(f"X: {current_data['targetPos']['x']}, Y: {current_data['targetPos']['y']}")
        
        # Create a visual representation of the map with target
        st.write("### Map Representation")
        map_size = 300  # Size of the visual map
        
        # Create a map visualization showing target position
        map_container = st.container()
        map_container.markdown(
            f"""
            <div style="position: relative; width: {map_size}px; height: {map_size}px; 
                        border: 2px solid gray; background-color: #1e293b;">
                <div style="position: absolute; width: 20px; height: 20px; 
                            background-color: #60a5fa; border-radius: 50%;
                            top: {current_data['targetPos']['y'] * map_size / 2000}px; 
                            left: {current_data['targetPos']['x'] * map_size / 2000}px;
                            transform: translate(-50%, -50%);">
                </div>
                <div style="position: absolute; bottom: 5px; right: 5px; 
                            color: white; font-size: 12px;">
                    Map (2000x2000)
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
        
        # Display game details
        if "password" in current_data:
            st.write(f"### Password: {current_data['password']}")
        
        # Action details
        st.write(f"### Total Actions: {len(current_data['actions'])}")
        with st.expander("View Actions", expanded=False):
            action_df = []
            for i, action in enumerate(current_data["actions"]):
                action_type = action.get("action", "unknown")
                x = action.get("x_offset", "N/A")
                y = action.get("y_offset", "N/A")
                action_df.append({"#": i+1, "Type": action_type, "X": x, "Y": y})
            
            st.table(action_df)
        
        # Show movement data if available
        if "startPos" in current_data and "endPos" in current_data:
            st.write("### Movement Summary")
            st.write(f"Start position: X: {current_data['startPos']['x']}, Y: {current_data['startPos']['y']}")
            st.write(f"End position: X: {current_data['endPos']['x']}, Y: {current_data['endPos']['y']}")
            
            # Calculate distance moved
            dx = current_data['endPos']['x'] - current_data['startPos']['x']
            dy = current_data['endPos']['y'] - current_data['startPos']['y']
            distance = (dx**2 + dy**2)**0.5
            st.write(f"Distance moved: {distance:.2f} pixels")

        # Full JSON data
        with st.expander("Full JSON Data", expanded=False):
            st.json(current_data)


if __name__ == "__main__":
    main()
