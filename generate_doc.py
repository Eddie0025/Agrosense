from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

def create_document():
    doc = Document()

    # --- Setup Styles ---
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Arial'
    font.size = Pt(11)

    # --- Title ---
    title = doc.add_heading('AgroSense: The Future of Precision Agriculture', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph('Empowering Agriculture through Intelligent Data and AI').alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_page_break()

    # --- Executive Summary ---
    doc.add_heading('1. Executive Summary', level=1)
    p = doc.add_paragraph(
        "AgroSense is a cutting-edge digital ecosystem designed to revolutionize agricultural management. "
        "By leveraging real-time data, AI-driven advisory, and community collaboration, AgroSense provides "
        "farmers with the tools they need to optimize yields, reduce waste, and maximize profitability. "
        "The platform bridges the gap between traditional expertise and modern technological precision."
    )

    # --- Problem Statement ---
    doc.add_heading('2. The Problem', level=1)
    doc.add_paragraph(
        "Modern agriculture faces several critical challenges that AgroSense is designed to solve:"
    )
    problems = [
        "Inaccessible Real-time Data: Farmers often operate without precise knowledge of their soil and weather conditions.",
        "Inefficient Scheduling: Irrigation and fertilization are often done based on guesswork rather than data-driven needs.",
        "Financial Opacity: Many small-to-medium farmers struggle to track input costs versus harvest revenue.",
        "Knowledge Silos: Innovative farming techniques are often not efficiently shared between farming communities."
    ]
    for problem in problems:
        doc.add_paragraph(problem, style='List Bullet')

    # --- Solution: The AgroSense Ecosystem ---
    doc.add_heading('3. The AgroSense Solution', level=1)
    doc.add_paragraph(
        "AgroSense addresses these issues through an integrated mobile-first platform featuring:"
    )
    solutions = [
        "Intelligent Dashboards: Real-time visibility into farm metrics and plot health.",
        "Farmer AI Advisor: A proactive AI that schedules critical activities like irrigation and pest control.",
        "Financial Ledger: A dedicated system for tracking expenses and revenue per crop cycle.",
        "Community Hub: A social platform for knowledge exchange and collaborative problem-solving."
    ]
    for solution in solutions:
        doc.add_paragraph(solution, style='List Bullet')

    # --- Key Features ---
    doc.add_heading('4. Key Modules & Features', level=1)
    
    doc.add_heading('4.1 Farm Portfolio & Plot Management', level=2)
    doc.add_paragraph(
        "Users can manage multiple farm plots, documenting soil types (e.g., Alluvial, Clayey) and "
        "irrigation sources (e.g., Tubewell, Canal). This granular data allows for highly specific AI recommendations."
    )

    doc.add_heading('4.2 Crop Lifecycle Tracking', level=2)
    doc.add_paragraph(
        "The platform tracks the entire lifecycle of crops from sowing to harvest. It records varieties, "
        "expected harvest dates, and actual yield metrics to build a historical database of farm performance."
    )

    doc.add_heading('4.3 Smart Calendar (Farmer AI)', level=2)
    doc.add_paragraph(
        "The core innovation of AgroSense is its AI-driven scheduling. The 'Farmer AI' analyzes environmental "
        "data to proactively suggest irrigation, fertilizer application, and pest control events. Each event "
        "includes an AI rationale, explaining the 'why' behind the recommendation."
    )

    doc.add_heading('4.4 Economics & Profitability Ledger', level=2)
    doc.add_paragraph(
        "A robust financial module allows farmers to log costs in categories such as seeds, labor, and fertilizer. "
        "When harvest revenue is recorded, the system automatically calculates ROI, providing clear financial insights."
    )

    doc.add_heading('4.5 Community Social Feed', level=2)
    doc.add_paragraph(
        "A platform for farmers to share updates, images, and tips. This fosters a community of practice, "
        "allowing farmers to learn from each other's successes and challenges."
    )

    # --- Technical Architecture ---
    doc.add_heading('5. Technical Architecture', level=1)
    doc.add_paragraph(
        "AgroSense is built using a modern, scalable, and secure technology stack:"
    )
    tech_stack = [
        "Frontend: Next.js 16+, React 19, and TypeScript for a high-performance, type-safe user interface.",
        "Styling: Tailwind CSS 4 and Framer Motion for a premium, responsive design with smooth interactions.",
        "Database & Backend: Supabase (PostgreSQL) providing real-time data synchronization.",
        "Security: Row Level Security (RLS) ensures that every farmer's data is isolated and secure by default.",
        "Data Visualization: Recharts for interactive charts and graphs of farm performance.",
        "Mobile Wrapper: Capacitor integration for a consistent experience across iOS, Android, and Web."
    ]
    for tech in tech_stack:
        doc.add_paragraph(tech, style='List Bullet')

    # --- Future Roadmap ---
    doc.add_heading('6. Future Roadmap', level=1)
    roadmap = [
        "IoT Soil Sensors: Direct integration with hardware for real-time nitrogen, phosphorus, and potassium (NPK) monitoring.",
        "Computer Vision: AI-based pest and disease detection using smartphone camera images.",
        "Marketplace Integration: Direct access to quality seeds, fertilizers, and tools from verified vendors.",
        "Export & Reporting: One-click generation of farm health and financial reports for bank loans and insurance."
    ]
    for item in roadmap:
        doc.add_paragraph(item, style='List Bullet')

    # --- Conclusion ---
    doc.add_heading('7. Conclusion', level=1)
    doc.add_paragraph(
        "AgroSense is more than just an app; it is a digital transformation tool for the agricultural sector. "
        "By putting data and AI in the hands of farmers, we are enabling a more sustainable, profitable, and "
        "resilient future for global agriculture."
    )

    # --- Save ---
    # Robust way to find the Desktop path
    home = os.path.expanduser("~")
    
    # Common Desktop locations
    possible_desktops = [
        os.path.join(home, 'Desktop'),
        os.path.join(home, 'OneDrive', 'Desktop'),
        os.path.join(home, 'OneDrive - Personal', 'Desktop')
    ]
    
    desktop = None
    for d in possible_desktops:
        if os.path.exists(d):
            desktop = d
            break
    
    if not desktop:
        # Fallback to home if desktop not found
        desktop = home
        
    save_path = os.path.join(desktop, 'AgroSense_Project_Report.docx')
    
    doc.save(save_path)
    return save_path

if __name__ == "__main__":
    try:
        path = create_document()
        print(f"Document successfully created at: {path}")
    except Exception as e:
        import traceback
        print(f"Error creating document: {e}")
        traceback.print_exc()
