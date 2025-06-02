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
        page_title="Frog Crossing Dataset Visualizer",
        layout="wide",
    )

    # Initialize session state variables if they don't exist
    if "current_index" not in st.session_state:
        st.session_state.current_index = 0
    
    if "displayed_image" not in st.session_state:
        st.session_state.displayed_image = None
    
    if "image_category" not in st.session_state:
        st.session_state.image_category = "initial"

    # Use first command line argument as dataset path if provided
    default_dataset_path = "../datasets/frog-crossing/frog-crossing_20250602T182716/dataset.jsonl"
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
            st.session_state.image_category = "initial"

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
        
        # Categorize images for frog-crossing
        images = current_data["images"]
        image_categories = {}
        
        # Create image categories
        image_categories["initial"] = images[0] if images else None
        image_categories["started"] = images[1] if len(images) >= 2 else None
        image_categories["final"] = images[-1] if len(images) >= 2 else None
        
        # Group movement operations (all images between started and final)
        move_images = []
        if len(images) > 3:
            for i, img_path in enumerate(images[2:-1], 2):  # Skip initial, started and final images
                move_images.append(img_path)
        
        image_categories["movements"] = move_images
        
        # Define functions to select which image to display
        def show_image(category, index=None):
            if category == "movements" and index is not None:
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
        preview_image_width = 120
        main_image_width = 500
        
        st.subheader("Thumbnails")
        col1, col2, col3 = st.columns(3)
        
        # Show initial image
        with col1:
            if image_categories["initial"]:
                st.image(str(dataset_dir / image_categories["initial"]), width=preview_image_width)
                st.button("Initial", on_click=show_image, args=("initial",))
                
        # Show started image
        with col2:
            if image_categories["started"]:
                st.image(str(dataset_dir / image_categories["started"]), width=preview_image_width)
                st.button("Started", on_click=show_image, args=("started",))
        
        # Show final image
        with col3:
            if image_categories["final"]:
                st.image(str(dataset_dir / image_categories["final"]), width=preview_image_width)
                st.button("Final", on_click=show_image, args=("final",))
        
        # Show movement operations in expandable section
        if image_categories["movements"]:
            num_operations = len(image_categories["movements"])
            with st.expander(f"Movement Steps ({num_operations})", expanded=False):
                # Use grid layout for the movement steps
                cols_per_row = 4
                rows = (num_operations + cols_per_row - 1) // cols_per_row
                
                for row in range(rows):
                    cols = st.columns(cols_per_row)
                    for col in range(cols_per_row):
                        idx = row * cols_per_row + col
                        if idx < num_operations:
                            img_path = image_categories["movements"][idx]
                            # Extract the move number from the path
                            move_num = img_path.split('_')[-2]
                            
                            with cols[col]:
                                st.image(str(dataset_dir / img_path), width=preview_image_width)
                                st.button(f"Move {move_num}", key=f"move_{idx}", on_click=show_image, args=("movements", idx))
        
        # Show the currently selected image
        st.subheader("Selected Image")
        if st.session_state.displayed_image is not None:
            st.image(
                str(st.session_state.displayed_image),
                caption=str(st.session_state.displayed_image.name),
                width=None,  # Full width
            )

    with col_data:
        st.subheader("Frog Crossing Data")
        
        # Display frog position information
        st.write("### Frog Positions")
        st.write(f"Initial Position: X: {current_data['initialFrogPos']['x']}, Y: {current_data['initialFrogPos']['y']}")
        st.write(f"Final Position: X: {current_data['finalFrogPos']['x']}, Y: {current_data['finalFrogPos']['y']}")
        
        # Display password if available
        if "password" in current_data:
            st.write(f"### Password: {current_data['password']}")
        
        # Show seed
        if "seed" in current_data:
            st.write(f"### Seed: {current_data['seed']}")
        
        # Display actions
        st.write(f"### Actions ({len(current_data['actions'])})")
        with st.expander("View Actions", expanded=True):
            action_data = []
            for i, action in enumerate(current_data["actions"]):
                action_type = action.get("action", "unknown")
                key = action.get("key", "N/A")
                action_data.append({"#": i+1, "Action": action_type, "Key": key})
            
            # Display actions in a table
            st.table(action_data)
        
        # Full JSON data
        with st.expander("Full JSON Data", expanded=False):
            st.json(current_data)


if __name__ == "__main__":
    main()
