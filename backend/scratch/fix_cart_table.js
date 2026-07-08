const sequelize = require("../config/db");

async function fixCartTable() {
  try {
    console.log("Synchronizing Cart table schema safely...");
    
    // Clear cart first to avoid issues
    await sequelize.query("DELETE FROM cart");
    
    // Drop foreign keys if they exist (ignoring errors)
    try { await sequelize.query("ALTER TABLE cart DROP FOREIGN KEY fk_cart_customer"); } catch(e){}
    try { await sequelize.query("ALTER TABLE cart DROP FOREIGN KEY fk_cart_user"); } catch(e){}
    
    // Drop columns if they exist (ignoring errors)
    try { await sequelize.query("ALTER TABLE cart DROP COLUMN customer_id"); } catch(e){}
    try { await sequelize.query("ALTER TABLE cart DROP COLUMN user_id"); } catch(e){}

    // Add columns
    console.log("Adding columns...");
    await sequelize.query("ALTER TABLE cart ADD COLUMN customer_id INT NULL AFTER variation_id");
    await sequelize.query("ALTER TABLE cart ADD COLUMN user_id INT NOT NULL AFTER customer_id");
    
    // Add foreign keys
    console.log("Adding foreign keys...");
    await sequelize.query("ALTER TABLE cart ADD CONSTRAINT fk_cart_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE");
    await sequelize.query("ALTER TABLE cart ADD CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE");
    
    console.log("Table 'cart' updated successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error updating cart table:", err.message);
    process.exit(1);
  }
}

fixCartTable();
