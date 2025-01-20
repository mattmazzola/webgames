import { useState } from "react";

interface MenuItem {
  label: string;
  items?: MenuItem[];
  isTarget?: boolean;
}

const MenuNavigator: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | null;
  }>({ text: "", type: null });

  const menuItems: MenuItem[] = [
    {
      label: "File",
      items: [
        {
          label: "New",
          items: [
            { label: "File" },
            { label: "Project" },
            { label: "Workspace" },
          ],
        },
        {
          label: "Open",
          items: [
            { label: "File..." },
            { label: "Folder..." },
            { label: "Workspace..." },
          ],
        },
        {
          label: "Save",
          items: [
            { label: "Save" },
            { label: "Save As..." },
            { label: "Save All" },
          ],
        },
        { label: "Exit" },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo" },
        { label: "Redo" },
        {
          label: "Advanced",
          items: [{ label: "Cut" }, { label: "Copy" }, { label: "Paste" }],
        },
      ],
    },
    {
      label: "View",
      items: [
        {
          label: "Security",
          items: [
            { label: "Permissions" },
            { label: "Show Passwords", isTarget: true },
            { label: "Encryption Settings" },
          ],
        },
        {
          label: "Appearance",
          items: [
            { label: "Zoom In" },
            { label: "Zoom Out" },
            { label: "Reset Zoom" },
          ],
        },
        {
          label: "Layout",
          items: [
            { label: "Centered" },
            { label: "Split View" },
            { label: "Toggle Sidebar" },
          ],
        },
      ],
    },
    {
      label: "Selection",
      items: [
        {
          label: "Select",
          items: [
            { label: "Select All" },
            { label: "Select None" },
            { label: "Expand Selection" },
          ],
        },
        {
          label: "Mark",
          items: [
            { label: "Mark for Delete" },
            { label: "Mark for Copy" },
            { label: "Clear Marks" },
          ],
        },
      ],
    },
    {
      label: "Help",
      items: [
        {
          label: "Support",
          items: [
            { label: "Documentation" },
            { label: "Community" },
            { label: "Report Issue" },
          ],
        },
        {
          label: "Updates",
          items: [
            { label: "Check Now" },
            { label: "Release Notes" },
            { label: "About" },
          ],
        },
      ],
    },
  ];

  const handleMenuClick = (menuLabel: string) => {
    if (activeMenu === menuLabel) {
      setActiveMenu(null);
      setActiveSubmenu(null);
    } else {
      setActiveMenu(menuLabel);
      setActiveSubmenu(null);
    }
  };

  const handleSubmenuClick = (item: MenuItem) => {
    if (item.isTarget) {
      setMessage({
        text: "Congratulations! The completion password is: MenuMaster2024",
        type: "success",
      });
    } else if (item.items) {
      // Don't close the menu if there are subitems
      return;
    } else {
      setMessage({
        text: "Keep exploring the menus...",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Instructions Card */}
      <div className="flex justify-center mt-8">
        <div className="bg-white rounded-xl p-6 mb-8 max-w-2xl shadow-sm">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Menu Navigator
          </h1>
          <p className="text-center text-gray-600">
            Navigate through the menu bar below to find the secret option. Click
            it to reveal the password!
          </p>
        </div>
      </div>

      {/* Desktop Window Container */}
      <div className="flex justify-center w-full">
        <div className="w-[900px] h-[600px] bg-white border border-gray-300 rounded-lg overflow-hidden">
          {/* Menu Bar */}
          <div className="bg-gray-800 text-white w-full">
            <div className="flex">
              {menuItems.map((menu) => (
                <div
                  key={menu.label}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(menu.label)}
                  onMouseLeave={() => {
                    if (!activeSubmenu) {
                      setActiveMenu(null);
                    }
                  }}
                >
                  <button
                    className={`px-6 py-3 hover:bg-gray-700 ${
                      activeMenu === menu.label ? "bg-gray-700" : ""
                    }`}
                    onClick={() => handleMenuClick(menu.label)}
                  >
                    {menu.label}
                  </button>
                  {activeMenu === menu.label && menu.items && (
                    <div
                      className="absolute left-0 top-full bg-gray-800 min-w-[200px] z-50 rounded-b-lg"
                      onMouseLeave={() => setActiveSubmenu(null)}
                    >
                      {menu.items.map((item) => (
                        <div
                          key={item.label}
                          className="relative"
                          onMouseEnter={() => setActiveSubmenu(item.label)}
                        >
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-700 flex justify-between items-center"
                            onClick={() => handleSubmenuClick(item)}
                          >
                            {item.label}
                            {item.items && <span className="ml-2">▶</span>}
                          </button>
                          {activeSubmenu === item.label && item.items && (
                            <div className="absolute left-full top-0 bg-gray-800 min-w-[200px] rounded-lg">
                              {item.items.map((subItem) => (
                                <button
                                  key={subItem.label}
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                                  onClick={() => handleSubmenuClick(subItem)}
                                >
                                  {subItem.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Background Area */}
          <div className="h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            {message.text && (
              <div className="bg-white/90 backdrop-blur rounded-lg p-6 max-w-md shadow-lg">
                <p
                  className={`text-lg ${
                    message.type === "error" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuNavigator;
